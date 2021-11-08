using EPharm.Data;
using EPharm.Logic.Apoteke;
using EPharm.Logic.Lekovi;
using MySqlConnector;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EPharm.Logic.Porudzbine
{
    public class Porudzbina
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("Porudzbina");

        public int ID { get; private set; }
        public DateTime Datum { get; set; }
        public string Kreirao { get; set; }
        public string Potvrdio { get; set; }
        public Apoteka Apoteka { get; set; }
        public List<PoruceniLek> PoruceniLekovi { get; }

        public Porudzbina()
        {
            Potvrdio = "";
            PoruceniLekovi = new List<PoruceniLek>();
        }

        public Porudzbina(int iD, DateTime datum, string kreirao, string potvrdio, Apoteka apoteka, List<PoruceniLek> poruceniLekovi)
        {
            ID = iD;
            Datum = datum;
            Kreirao = kreirao;
            Potvrdio = potvrdio;
            Apoteka = apoteka;
            PoruceniLekovi = poruceniLekovi;
        }

        public Porudzbina(DateTime datum, string kreirao, Apoteka ap, List<PoruceniLek> poruceniLekovi)
            : this(-1, datum, kreirao, "", ap, poruceniLekovi)
        {
        }

        public static async Task UcitajPoruceneLekove(Dictionary<int, Porudzbina> svePorudzbine)
        {
            int idPorudzbine = -1;
            int sifraLeka = -1;
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync("SELECT * FROM `porudzbine_lekovi`");

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        idPorudzbine = Convert.ToInt32(row["IDPorudzbine"]);
                        sifraLeka = Convert.ToInt32(row["SifraLeka"]);
                        short kolicina = Convert.ToInt16(row["Kolicina"]);

                        if (!svePorudzbine.TryGetValue(idPorudzbine, out Porudzbina p))
                            throw new Exception($"Porudžbina {idPorudzbine} za lek sa šifrom {sifraLeka} ne postoji!");

                        if (!LanacApoteka.BazaLekova.TryGetValue(sifraLeka, out Lek lek))
                            throw new Exception($"Podaci o leku sa šifrom {sifraLeka} ne postoje u bazi lekova!");

                        PoruceniLek poruceniLek = new PoruceniLek(idPorudzbine, sifraLeka, kolicina, lek);
                        p.PoruceniLekovi.Add(poruceniLek);
                    }
                    Log.WriteLine($"Poruceni lekovi uspesno ucitani!", Logging.Type.Success);
                }
                else
                    Log.WriteLine($"Tabela `porudzbine_lekovi` nije vratila podatke.", Logging.Type.Warning);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, $"{idPorudzbine}/{sifraLeka}");
            }
        }

        public async Task RegistrujPorudzbinu()
        {
            try
            {
                Datum = DateTime.Now;
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "INSERT INTO `porudzbine`(`Apoteka`, `Kreirao`, `Potvrdio`, `Datum`) VALUES (@apoteka, @kreirao, @potvrdio, @datum)";
                cmd.Parameters.AddWithValue("@apoteka", Apoteka.ID);
                cmd.Parameters.AddWithValue("@kreirao", Kreirao);
                cmd.Parameters.AddWithValue("@potvrdio", Potvrdio);
                cmd.Parameters.AddWithValue("@datum", MySQL.ConvertTime(Datum));
                int id = await MySQL.DB.QueryAsync(cmd);
                ID = id;

                foreach (PoruceniLek lek in PoruceniLekovi.ToList())
                {
                    try
                    {
                        if (!LanacApoteka.BazaLekova.TryGetValue(lek.SifraLeka, out Lek podaciLeka))
                            throw new Exception($"Podaci za lek sa šifrom {lek.SifraLeka} nisu pronađeni.");

                        if (lek.Kolicina < 1)
                            throw new Exception($"Nevalidna količina za lek sa šifrom {lek.SifraLeka}.");

                        lek.Podaci = podaciLeka;
                        await lek.RegistrujPoruceniLek();
                    }
                    catch (Exception ex) // Koristimo ovde try/catch jer ako neki lek nije ispravan, da se ne poremete ostali lekovi u porudžbini
                    {
                        Log.ExceptionTrace(ex);
                        PoruceniLekovi.Remove(lek); // Brisemo ga iz liste jer ne postoje podaci/doslo je do greske
                    }
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
        }

        public async Task PotvrdiPorudzbinu(string potvrdio)
        {
            Potvrdio = potvrdio;
            await SacuvajPodatke();
        }

        public async Task SacuvajPodatke()
        {
            try
            {
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `porudzbine` SET Potvrdio = @potvrdio WHERE ID = @id";
                cmd.Parameters.AddWithValue("@potvrdio", Potvrdio);
                cmd.Parameters.AddWithValue("@id", ID);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, ID.ToString());
            }
        }

        public async Task Obrisi()
        {
            MySqlCommand cmd = new MySqlCommand();
            cmd.CommandText = "DELETE FROM `porudzbine` WHERE ID = @id"; // Automatski se brisu poruceni lekovi za ovu porudzbinu iz baze
            cmd.Parameters.AddWithValue("@id", ID);
            await MySQL.DB.QueryAsync(cmd);
        }


        #region Poruceni lekovi
        public async Task DodajPoruceniLek(int sifraLeka, short kolicina, Lek podaciLeka)
        {
            PoruceniLek lek = new PoruceniLek(ID, sifraLeka, kolicina, podaciLeka);
            await lek.RegistrujPoruceniLek();
            PoruceniLekovi.Add(lek);
        }
        public async Task ObrisiPoruceniLek(PoruceniLek poruceniLek)
        {
            await poruceniLek.Obrisi();
            PoruceniLekovi.Remove(poruceniLek);
        }
        #endregion
    }
}
