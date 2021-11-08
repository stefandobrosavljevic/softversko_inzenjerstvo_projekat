using EPharm.Data;
using MySqlConnector;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace EPharm.Logic.Lekovi
{
    public class Lek
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("Lek");
        public int Sifra { get; set; }
        public string Ime { get; private set; }
        public string Opis { get; private set; }
        public string Slika { get; private set; }
        public short Cena { get; private set; }
        public short BrojTabli { get; private set; }

        public Lek(int sifra, string ime, string opis, string slika, short cena, short brojTabli)
        {
            Sifra = sifra;
            Ime = ime;
            Opis = opis;
            Slika = slika;
            Cena = cena;
            BrojTabli = brojTabli;
        }

        public async Task AzurirajPodatke(Lek noviPodaci)
        {
            Ime = noviPodaci.Ime;
            Opis = noviPodaci.Opis;
            Slika = noviPodaci.Slika;
            Cena = noviPodaci.Cena;
            BrojTabli = noviPodaci.BrojTabli;
            await SacuvajPodatke();
        }

        public async Task SacuvajPodatke()
        {
            try
            {
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `lekovi` SET Ime = @ime, Opis = @opis, Slika = @slika, Cena = @cena, BrojTabli = @brTabli WHERE Sifra = @sifra";
                cmd.Parameters.AddWithValue("@ime", Ime);
                cmd.Parameters.AddWithValue("@opis", Opis);
                cmd.Parameters.AddWithValue("@slika", Slika);
                cmd.Parameters.AddWithValue("@cena", Cena);
                cmd.Parameters.AddWithValue("@brTabli", BrojTabli);
                cmd.Parameters.AddWithValue("@sifra", Sifra);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, Sifra.ToString());
            }
        }
    }
}
