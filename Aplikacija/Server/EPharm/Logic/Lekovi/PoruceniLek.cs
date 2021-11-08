using EPharm.Data;
using MySqlConnector;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace EPharm.Logic.Lekovi
{
    public class PoruceniLek
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("PoruceniLek");
        public int IDPorudzbine { get; }
        public int SifraLeka { get; }
        public short Kolicina { get; private set; }
        public Lek Podaci { get; set; }


        public PoruceniLek(int idPorudzbine, int sifraLeka, short kolicina, Lek podaci)
        {
            IDPorudzbine = idPorudzbine;
            SifraLeka = sifraLeka;
            Kolicina = kolicina;
            Podaci = podaci;
        }

        public async Task RegistrujPoruceniLek()
        {
            MySqlCommand cmd = new MySqlCommand();
            cmd.CommandText = "INSERT INTO `porudzbine_lekovi`(`IDPorudzbine`, `SifraLeka`, `Kolicina`) VALUES (@id, @sifra, @kolicina)";
            cmd.Parameters.AddWithValue("@id", IDPorudzbine);
            cmd.Parameters.AddWithValue("@sifra", SifraLeka);
            cmd.Parameters.AddWithValue("@kolicina", Kolicina);
            await MySQL.DB.QueryAsync(cmd);
        }

        public async Task Obrisi()
        {
            MySqlCommand cmd = new MySqlCommand();
            cmd.CommandText = "DELETE FROM `porudzbine_lekovi` WHERE IDPorudzbine = @id AND SifraLeka = @sifra";
            cmd.Parameters.AddWithValue("@id", IDPorudzbine);
            cmd.Parameters.AddWithValue("@sifra", SifraLeka);
            await MySQL.DB.QueryAsync(cmd);
        }

        public async Task IzmeniKolicinu(short kolicina)
        {
            Kolicina = kolicina;
            await SacuvajPodatke();
        }

        public async Task SacuvajPodatke()
        {
            try
            {
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `porudzbine_lekovi` SET Kolicina = @kolicina WHERE IDPorudzbine = @id AND SifraLeka = @sifra";
                cmd.Parameters.AddWithValue("@kolicina", Kolicina);
                cmd.Parameters.AddWithValue("@id", IDPorudzbine);
                cmd.Parameters.AddWithValue("@sifra", SifraLeka);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, $"{IDPorudzbine}/{SifraLeka}");
            }
        }
    }
}
