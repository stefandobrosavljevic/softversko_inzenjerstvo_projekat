using EPharm.Data;
using EPharm.Logic.Apoteke;
using MySqlConnector;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace EPharm.Logic.Lekovi
{
    public class ALek
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("ALek");
        public float Kolicina { get; set; }
        public short KriticnaKolicina { get; set; }
        public bool Deljiv { get; set; }
        public Apoteka Apoteka { get; set; }
        public Lek PodaciLeka { get; set; }

        public ALek(float kolicina, short kriticnaKolicina, bool deljiv, Apoteka apoteka, Lek podaciLeka)
        {
            Kolicina = kolicina;
            KriticnaKolicina = kriticnaKolicina;
            Deljiv = deljiv;
            Apoteka = apoteka;
            PodaciLeka = podaciLeka;
        }

        public async Task AzurirajPodatke(ALek noviPodaci)
        {
            Kolicina = noviPodaci.Kolicina;
            KriticnaKolicina = noviPodaci.KriticnaKolicina;
            Deljiv = noviPodaci.Deljiv;
            await SacuvajPodatke();
            await PodaciLeka.AzurirajPodatke(noviPodaci.PodaciLeka);
        }

        public async Task SacuvajPodatke()
        {
            try
            {
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `apoteke_lekovi` SET Kolicina = @kolicina, KriticnaKolicina = @kritKol, Deljiv = @deljiv WHERE Sifra = @sifra AND Apoteka = @ap";
                cmd.Parameters.AddWithValue("@kolicina", Kolicina);
                cmd.Parameters.AddWithValue("@kritKol", KriticnaKolicina);
                cmd.Parameters.AddWithValue("@deljiv", Deljiv);
                cmd.Parameters.AddWithValue("@sifra", PodaciLeka.Sifra);
                cmd.Parameters.AddWithValue("@ap", Apoteka.ID);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, PodaciLeka.Sifra.ToString());
            }
        }

        public static bool DaLiJeKolicinaValidna(float kolicina, bool deljiv)
        {
            try
            {
                if (kolicina >= 0)
                {
                    if (!deljiv)
                    {
                        // True ukoliko nije ceo broj
                        if (Math.Round(kolicina) != kolicina)
                            return false;
                    }
                    return true;
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
            return false;
        }
    }
}
