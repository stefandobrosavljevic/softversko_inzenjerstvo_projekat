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
    public enum StatusObavestenja
    {
        POSLATO = 1,
        PREGLEDANO = 2,
        OBRISANO = 3
    }

    public class Obavestenje
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("Obavestenje");

        [JsonIgnore] public Korisnik Korisnik { get; set; }
        public StatusObavestenja Status { get; set; }
        public Poruka Poruka { get; set; }

        public Obavestenje(Korisnik korisnik, StatusObavestenja status, Poruka poruka)
        {
            Korisnik = korisnik;
            Status = status;
            Poruka = poruka;
        }

        public static async Task UcitajObavestenja(Dictionary<int, Poruka> svaObavestenja)
        {
            int idObavestenja = -1;
            string username = "";
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync("SELECT * FROM `zaposleni_obavestenja`");

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        idObavestenja = Convert.ToInt32(row["IDObavestenja"]);
                        username = Convert.ToString(row["UsernameNadleznog"]);

                        if (!Enum.TryParse<StatusObavestenja>(row["Status"].ToString(), out StatusObavestenja status))
                            throw new Exception($"Status za obavestenje ID: {idObavestenja} nije validan! ({row["Status"].ToString()})");

                        Korisnik korisnik = LanacApoteka.PronadjiZaposlenog(username);
                        if (korisnik == null)
                            throw new Exception($"Korisnik za obavestenje ID: {idObavestenja} nije pronađen! ({username})");

                        if (!svaObavestenja.TryGetValue(idObavestenja, out Poruka poruka))
                            throw new Exception($"Poruka obavestenja za ID: {idObavestenja} nije pronađena!");

                        Obavestenje obavestenje = new Obavestenje(korisnik, status, poruka);
                        korisnik.Obavestenja.Add(obavestenje);
                    }
                    Log.WriteLine($"Obavestenja zaposlenih uspesno ucitana!", Logging.Type.Success);
                }
                else
                    Log.WriteLine($"Tabela `zaposleni_obavestenja` nije vratila podatke.", Logging.Type.Warning);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, $"{idObavestenja}/{username}");
            }
        }

        public async Task RegistrujObavestenje()
        {
            MySqlCommand cmd = new MySqlCommand();
            cmd.CommandText = "INSERT INTO `zaposleni_obavestenja`(`IDObavestenja`, `UsernameNadleznog`, `Status`) VALUES (@id, @username, @status)";
            cmd.Parameters.AddWithValue("@id", Poruka.ID);
            cmd.Parameters.AddWithValue("@username", Korisnik.Username);
            cmd.Parameters.AddWithValue("@status", Status.ToString());
            await MySQL.DB.QueryAsync(cmd);
        }

        public async Task PromeniStatus(StatusObavestenja noviStatus)
        {
            try
            {
                Status = noviStatus;

                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `zaposleni_obavestenja` SET Status = @status WHERE IDObavestenja = @id";
                cmd.Parameters.AddWithValue("@status", Status.ToString());
                cmd.Parameters.AddWithValue("@id", Poruka.ID);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, $"{Poruka.ID}/{Korisnik.Username}");
            }
        }
    }
}
