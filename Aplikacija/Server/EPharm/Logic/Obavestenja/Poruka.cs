using EPharm.Data;
using EPharm.Logic.Zaposleni;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EPharm.Logic.Obavestenja
{
    public class Poruka
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("Poruka");

        public int ID { get; set; }
        public string Tekst { get; set; }
        public DateTime Datum { get; set; }

        public Poruka(int id, string tekst, DateTime datum)
        {
            ID = id;
            Tekst = tekst;
            Datum = datum;
        }

        public Poruka(string tekst)
        {
            ID = -1;
            Tekst = tekst;
            Datum = DateTime.Now;
        }

        public static async Task UcitajPorukeObavestenja()
        {
            int id = -1;
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync("SELECT * FROM `obavestenja`");

                if (dt != null && dt.Rows.Count > 0)
                {
                    Dictionary<int, Poruka> svaObavestenja = new Dictionary<int, Poruka>();

                    foreach (DataRow row in dt.Rows)
                    {
                        id = Convert.ToInt32(row["ID"]);
                        string tekst = Convert.ToString(row["Tekst"]);
                        DateTime datum = Convert.ToDateTime(row["Datum"]);

                        Poruka p = new Poruka(id, tekst, datum);
                        svaObavestenja.Add(id, p);
                    }
                    Log.WriteLine($"Poruke obavestenja uspesno ucitane!", Logging.Type.Success);

                    Log.WriteLine("Sledi ucitavanje obavestenja zaposlenih...");
                    await Obavestenje.UcitajObavestenja(svaObavestenja);
                }
                else
                    Log.WriteLine($"Tabela `obavestenja` nije vratila podatke.", Logging.Type.Warning);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, id.ToString());
            }
        }

        public async Task RegistrujNovuPoruku(List<Korisnik> korisniciZaObavestavanje)
        {
            try
            {
                Datum = DateTime.Now;
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "INSERT INTO `obavestenja`(`Tekst`, `Datum`) VALUES (@tekst, @datum)";
                cmd.Parameters.AddWithValue("@tekst", Tekst);
                cmd.Parameters.AddWithValue("@datum", MySQL.ConvertTime(Datum));
                int id = await MySQL.DB.QueryAsync(cmd);
                ID = id;

                foreach (Korisnik korisnik in korisniciZaObavestavanje)
                {
                    try
                    {
                        Obavestenje obavestenje = new Obavestenje(korisnik, StatusObavestenja.POSLATO, this);
                        await obavestenje.RegistrujObavestenje();
                        korisnik.Obavestenja.Add(obavestenje);
                    }
                    catch (Exception ex) // Koristimo ovde try/catch jer ako dodje do greske za nekog od korisnika, da ne dodje do greske i za sve ostale
                    {
                        Log.ExceptionTrace(ex);
                    }
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
        }
    }
}
