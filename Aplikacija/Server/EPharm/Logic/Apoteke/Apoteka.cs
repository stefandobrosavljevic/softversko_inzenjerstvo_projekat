using EPharm.Data;
using EPharm.Logic.Lekovi;
using EPharm.Logic.Obavestenja;
using EPharm.Logic.Porudzbine;
using EPharm.Logic.Zaposleni;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EPharm.Logic.Apoteke
{
    public class Apoteka
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("Apoteka");

        public int ID { get; set; }
        public string Adresa { get; set; }
        public string Grad { get; set; }
        public string Telefon { get; set; }
        [JsonIgnore] public List<Korisnik> Zaposleni { get; }
        [JsonIgnore] public List<ALek> Lekovi { get; }
        [JsonIgnore] public List<Porudzbina> Porudzbine { get; }

        public Apoteka(int id, string adresa, string grad, string telefon)
        {
            ID = id;
            Adresa = adresa;
            Grad = grad;
            Telefon = telefon;
            Zaposleni = new List<Korisnik>();
            Lekovi = new List<ALek>();
            Porudzbine = new List<Porudzbina>();
        }

        public static async Task UcitajLekove()
        {
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync("SELECT * FROM `apoteke_lekovi`");

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        int sifra = Convert.ToInt32(row["Sifra"]);
                        int ID = Convert.ToInt32(row["Apoteka"]);
                        float kolicina = Convert.ToSingle(row["Kolicina"]);
                        short kritKolicina = Convert.ToInt16(row["KriticnaKolicina"]);
                        bool deljiv = Convert.ToBoolean(row["Deljiv"]);

                        if (!LanacApoteka.Apoteke.TryGetValue(ID, out Apoteka ap))
                            throw new Exception($"Apoteka {ID} za lek {sifra} nije pronađena!");

                        if (!LanacApoteka.BazaLekova.TryGetValue(sifra, out Lek lek))
                            throw new Exception($"Podaci za lek sa šifrom {sifra} nisu pronađeni u bazi lekova!");

                        ALek aLek = new ALek(kolicina, kritKolicina, deljiv, ap, lek);
                        ap.Lekovi.Add(aLek);
                    }
                    Log.WriteLine($"Lekovi u apotekama uspesno ucitani!", Logging.Type.Success);
                }
                else
                    Log.WriteLine($"Tabela `apoteke_lekovi` nije vratila podatke.", Logging.Type.Warning);

            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
        }

        public async Task SacuvajPodatke()
        {
            try
            {
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `apoteke` SET Adresa = @adresa, Grad = @grad, Telefon = @tel WHERE ID = @id";
                cmd.Parameters.AddWithValue("@adresa", Adresa);
                cmd.Parameters.AddWithValue("@grad", Grad);
                cmd.Parameters.AddWithValue("@tel", Telefon);
                cmd.Parameters.AddWithValue("@id", ID);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, ID.ToString());
            }
        }

        #region Zaposleni
        public static async Task UcitajZaposlene()
        {
            string username = "";
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync("SELECT * FROM `zaposleni`");

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        username = Convert.ToString(row["KorisnickoIme"]);
                        string pass = Convert.ToString(row["Lozinka"]);
                        string salt = Convert.ToString(row["LozinkaSalt"]);
                        string ime = Convert.ToString(row["Ime"]);
                        string prezime = Convert.ToString(row["Prezime"]);
                        string email = Convert.ToString(row["Email"]);
                        string telefon = Convert.ToString(row["Telefon"]);
                        string role = Convert.ToString(row["Uloga"]);
                        int apotekaID = Convert.ToInt32(row["Apoteka"]);


                        if (!Enum.TryParse<Uloge>(role, out Uloge uloga))
                            throw new Exception($"Uloga {role} ne postoji u enumu Uloge!");

                        if (!LanacApoteka.Apoteke.TryGetValue(apotekaID, out Apoteka ap))
                            throw new Exception($"Apoteka {apotekaID} ne postoji u listi apoteka!");

                        Korisnik korisnik = new Korisnik(username, pass, salt, ime, prezime, email, telefon, ap, uloga);
                        ap.Zaposleni.Add(korisnik);
                    }
                    Log.WriteLine($"Zaposleni u apotekama uspesno ucitani!", Logging.Type.Success);
                }
                else
                    Log.WriteLine($"Tabela `zaposleni` nije vratila podatke.", Logging.Type.Warning);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, username);
            }
        }
        public async Task KreirajZaposlenog(Korisnik noviRadnik, string password)
        {
            noviRadnik.Apoteka = this;
            Zaposleni.Add(noviRadnik);
            await noviRadnik.RegistrujZaposlenog(password);
        }
        public async Task<bool> ObrisiZaposlenog(string username)
        {
            try
            {
                Korisnik zaposleni = this.Zaposleni.FirstOrDefault(z => z.Username == username);
                if (zaposleni != null)
                {
                    Zaposleni.Remove(zaposleni);
                    MySqlCommand cmd = new MySqlCommand();
                    cmd.CommandText = "DELETE FROM `zaposleni` WHERE KorisnickoIme = @user";
                    cmd.Parameters.AddWithValue("@user", username);
                    await MySQL.DB.QueryAsync(cmd);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
            return false;
        }
        #endregion


        #region Porudzbine
        public static async Task UcitajPorudzbine()
        {
            int id = -1;
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync("SELECT * FROM `porudzbine`");

                if (dt != null && dt.Rows.Count > 0)
                {
                    Dictionary<int, Porudzbina> svePorudzbine = new Dictionary<int, Porudzbina>();

                    foreach (DataRow row in dt.Rows)
                    {
                        id = Convert.ToInt32(row["ID"]);
                        short apotekaID = Convert.ToInt16(row["Apoteka"]);
                        string kreirao = Convert.ToString(row["Kreirao"]);
                        string potvrdio = Convert.ToString(row["Potvrdio"]);
                        DateTime datum = Convert.ToDateTime(row["Datum"]);

                        if (!LanacApoteka.Apoteke.TryGetValue(apotekaID, out Apoteka ap))
                            throw new Exception($"Apoteka {apotekaID} ne postoji u listi apoteka!");

                        Porudzbina p = new Porudzbina(id, datum, kreirao, potvrdio, ap, new List<PoruceniLek>());
                        ap.Porudzbine.Add(p);
                        svePorudzbine.Add(id, p);
                    }
                    Log.WriteLine($"Porudzbine uspesno ucitane!", Logging.Type.Success);

                    Log.WriteLine("Sledi ucitavanje porucenih lekova...");
                    await Porudzbina.UcitajPoruceneLekove(svePorudzbine);
                }
                else
                    Log.WriteLine($"Tabela `zaposleni` nije vratila podatke.", Logging.Type.Warning);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, id.ToString());
            }
        }

        public async Task KreirajPorudzbinu(Porudzbina porudzbina)
        {
            porudzbina.Apoteka = this;
            Porudzbine.Add(porudzbina);
            await porudzbina.RegistrujPorudzbinu();
        }

        public async Task ObrisiPorudzbinu(Porudzbina porudzbina)
        {
            Porudzbine.Remove(porudzbina);
            await porudzbina.Obrisi();
        }
        #endregion

        #region Obavestenja
        public async Task KreirajNovoObavestenje(Poruka novaPoruka, Uloge[] ulogePrimaoca)
        {
            if (ulogePrimaoca == null || ulogePrimaoca.Length < 1 || novaPoruka.Tekst.Length > 150)
                return;

            List<Korisnik> nadlezni = Zaposleni.FindAll(k => ulogePrimaoca.Contains(k.Uloga));
            await novaPoruka.RegistrujNovuPoruku(nadlezni);
        }
        #endregion

        public static bool IsPhoneNumberValid(string number)
        {
            try
            {
                if (number.Length >= 1 && number.Length <= 20 && number.Any(char.IsDigit))
                    return true;
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
            return false;
        }
    }
}
