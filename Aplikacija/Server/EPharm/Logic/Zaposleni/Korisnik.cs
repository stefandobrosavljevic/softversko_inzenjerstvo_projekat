using EPharm.Data;
using EPharm.Logic.Apoteke;
using EPharm.Logic.Auth;
using EPharm.Logic.Lekovi;
using EPharm.Logic.Obavestenja;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EPharm.Logic.Zaposleni
{
    public enum Uloge
    {
        FarmTehnicar = 1,
        Farmaceut = 2,
        Upravnik = 3,
        Vlasnik = 4
    }
    public class Korisnik
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("Korisnik");
        public string Username { get; set; }
        [JsonIgnore] private string Password;
        [JsonIgnore] private string PasswordSalt;
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public string Email { get; set; }
        public string Telefon { get; set; }
        public Apoteka Apoteka { get; set; }
        public List<Obavestenje> Obavestenja { get; set; }
        public Uloge Uloga { get; set; }

        public Korisnik()
        {
            Obavestenja = new List<Obavestenje>();
        }

        public Korisnik(string username, string password, string salt, string ime, string prezime, string email, string telefon, Apoteka apoteka, Uloge uloga)
            : this()
        {
            Username = username;
            Password = password;
            PasswordSalt = salt;
            Ime = ime;
            Prezime = prezime;
            Email = email;
            Telefon = telefon;
            Apoteka = apoteka;
            Uloga = uloga;
        }

        public async Task RegistrujZaposlenog(string password)
        {
            Tuple<string, string> passHashAndSalt = PasswordHashing.HashNewPassword(password);
            Password = passHashAndSalt.Item1;
            PasswordSalt = passHashAndSalt.Item2;

            MySqlCommand cmd = new MySqlCommand();
            cmd.CommandText = "INSERT INTO `zaposleni`(`KorisnickoIme`, `Lozinka`, `LozinkaSalt`, `Ime`, `Prezime`, `Email`, `Telefon`, `Uloga`, `Apoteka`) VALUES (@user,@lozinka,@salt,@ime,@prez,@email,@tel,@uloga,@ap)";
            cmd.Parameters.AddWithValue("@user", Username);
            cmd.Parameters.AddWithValue("@lozinka", Password);
            cmd.Parameters.AddWithValue("@salt", PasswordSalt);
            cmd.Parameters.AddWithValue("@ime", Ime);
            cmd.Parameters.AddWithValue("@prez", Prezime);
            cmd.Parameters.AddWithValue("@email", Email);
            cmd.Parameters.AddWithValue("@tel", Telefon);
            cmd.Parameters.AddWithValue("@uloga", Uloga.ToString());
            cmd.Parameters.AddWithValue("@ap", Apoteka.ID);
            await MySQL.DB.QueryAsync(cmd);
        }

        public async Task AzurirajPodatke(Korisnik noviPodaci)
        {
            Ime = noviPodaci.Ime;
            Prezime = noviPodaci.Prezime;
            Email = noviPodaci.Email;
            Telefon = noviPodaci.Telefon;
            await SacuvajPodatke();
        }

        public async Task SacuvajPodatke()
        {
            try
            {
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `zaposleni` SET Ime = @ime, Prezime = @prez, Email = @email, Telefon = @tel WHERE KorisnickoIme = @user";
                cmd.Parameters.AddWithValue("@ime", Ime);
                cmd.Parameters.AddWithValue("@prez", Prezime);
                cmd.Parameters.AddWithValue("@email", Email);
                cmd.Parameters.AddWithValue("@tel", Telefon);
                cmd.Parameters.AddWithValue("@user", Username);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex, Username);
            }
        }

        public async Task<string> IzmeniNalog(string password, string email, string telefon)
        {
            try
            {
                if (password.Length > 0)
                {
                    if (!IsPasswordValid(password))
                        return $"Lozinka mora da sadrži bar jedno veliko, malo slovo, broj i bar jedan karakter! Može da sadrži minimalno 5, maksimalno 30 karaktera.";

                    Tuple<string, string> passHashAndSalt = PasswordHashing.HashNewPassword(password);
                    Password = passHashAndSalt.Item1;
                    PasswordSalt = passHashAndSalt.Item2;
                }

                if (email.Length > 0)
                {
                    if (!IsEmailValid(email))
                        return $"Niste uneli validnu email adresu!";

                    Email = email;
                }

                if (telefon.Length > 0)
                {
                    if (!Apoteke.Apoteka.IsPhoneNumberValid(telefon))
                        return $"Niste uneli validan broj telefona!";

                    Telefon = telefon;
                }


                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `zaposleni` SET `Lozinka` = @loz, `LozinkaSalt` = @salt, `Email` = @email, `Telefon` = @tel WHERE KorisnickoIme = @user";
                cmd.Parameters.AddWithValue("@loz", Password);
                cmd.Parameters.AddWithValue("@salt", PasswordSalt);
                cmd.Parameters.AddWithValue("@email", Email);
                cmd.Parameters.AddWithValue("@tel", Telefon);
                cmd.Parameters.AddWithValue("@user", Username);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }

            return "";
        }

        public async Task<bool> IzmeniApoteku(Apoteka ap)
        {
            try
            {
                Apoteka = ap;

                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "UPDATE `zaposleni` SET `Apoteka` = @ap WHERE KorisnickoIme = @user";
                cmd.Parameters.AddWithValue("@ap", ap.ID);
                cmd.Parameters.AddWithValue("@user", Username);
                await MySQL.DB.QueryAsync(cmd);
                return true;
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
            return false;
        }

        public bool CheckPassword(string password)
        {
            string hash = PasswordHashing.HashPassword(password, PasswordSalt);

            return hash == Password;
        }


        private static readonly object threadIzdajlekove = new();
        public async Task<string> IzdajLekove(List<LekZaIzdavanje> lekoviZaIzdavanje)
        {
            lock (threadIzdajlekove)
            {
                if (lekoviZaIzdavanje.Count < 1)
                    return "Nisu izabrani lekovi za izdavanje!";

                foreach (LekZaIzdavanje izdLek in lekoviZaIzdavanje)
                {
                    if (izdLek.Kolicina <= 0)
                        return $"Nije poslata validna količina leka sa šifrom {izdLek.Sifra}!";

                    ALek lek = Apoteka.Lekovi.FirstOrDefault(z => z.PodaciLeka.Sifra == izdLek.Sifra);
                    if (lek == null)
                        return $"Lek sa šifrom {izdLek.Sifra} nije pronađen u apoteci!";

                    if (izdLek.IzdavanjePoTabli == true)
                    {
                        if (lek.Deljiv == false)
                            return $"Lek sa šifrom {izdLek.Sifra} se ne može izdavati na table!";

                        // Kolicina leka = Broj tabli
                        float kolicina = (float)izdLek.Kolicina / lek.PodaciLeka.BrojTabli;
                        izdLek.KolicinaZaIzdavanje = kolicina;
                    }
                    else
                        izdLek.KolicinaZaIzdavanje = izdLek.Kolicina;

                    izdLek.ALek = lek;
                    if (lek.Kolicina - izdLek.KolicinaZaIzdavanje < 0)
                        return $"Lek {lek.PodaciLeka.Ime} nije dostupan u izabranoj količini ({izdLek.KolicinaZaIzdavanje})!";
                }

                // Svi lekovi prosli sve provere, => smanjivanje kolicine
                foreach (LekZaIzdavanje izdLek in lekoviZaIzdavanje)
                {
                    float prethodnaKolicina = izdLek.ALek.Kolicina;
                    izdLek.ALek.Kolicina -= izdLek.KolicinaZaIzdavanje;

                    // Provera i obavestavanje nadleznih prilikom pada kolicine leka ispod kriticne
                    if (prethodnaKolicina >= izdLek.ALek.KriticnaKolicina && izdLek.ALek.Kolicina < izdLek.ALek.KriticnaKolicina)
                    {
                        Uloge[] nadlezni = new Uloge[] { Uloge.Upravnik, Uloge.Farmaceut };
                        string tekst = $"Količina leka {izdLek.ALek.PodaciLeka.Ime}(Šifra: {izdLek.Sifra}) je pala ispod kritične({izdLek.ALek.Kolicina}/{izdLek.ALek.KriticnaKolicina})!";
                        Poruka poruka = new Poruka(tekst);
                        _ = Apoteka.KreirajNovoObavestenje(poruka, nadlezni);
                    }
                }
            }

            MySqlCommand cmd = new MySqlCommand();
            cmd.CommandText = "INSERT INTO `log_izdavanje_lekova`(`Zaposleni`, `Apoteka`, `Datum`) VALUES (@zaposleni, @apoteka, @datum)";
            cmd.Parameters.AddWithValue("@zaposleni", Username);
            cmd.Parameters.AddWithValue("@apoteka", Apoteka.ID);
            cmd.Parameters.AddWithValue("@datum", MySQL.ConvertTime(DateTime.Now));
            int id = await MySQL.DB.QueryAsync(cmd);

            foreach (LekZaIzdavanje izdLek in lekoviZaIzdavanje)
            {
                try
                {
                    cmd = new MySqlCommand();
                    cmd.CommandText = "INSERT INTO `log_izdati_lekovi`(`ID`, `ImeLeka`, `SifraLeka`, `Kolicina`, `Cena`) VALUES (@id, @imeLeka, @sifra, @kolicina, @cena)";
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.Parameters.AddWithValue("@imeLeka", izdLek.ALek.PodaciLeka.Ime);
                    cmd.Parameters.AddWithValue("@sifra", izdLek.Sifra);
                    cmd.Parameters.AddWithValue("@kolicina", izdLek.KolicinaZaIzdavanje);
                    cmd.Parameters.AddWithValue("@cena", izdLek.KolicinaZaIzdavanje * izdLek.ALek.PodaciLeka.Cena);
                    await MySQL.DB.QueryAsync(cmd);
                    await izdLek.ALek.SacuvajPodatke();
                }
                catch (Exception ex)
                {
                    Log.ExceptionTrace(ex, $"{id}/{izdLek.Sifra}/{Username}");
                }
            }

            return "";
        }


        public static bool IsPasswordValid(string password)
        {
            try
            {
                if (password.Length < 5 || password.Length > 30 || !password.Any(char.IsDigit) || !password.Contains("!") && !password.Contains("@") && !password.Contains("#") && !password.Contains("$") && !password.Contains("%") && !password.Contains("^") && !password.Contains("&") && !password.Contains("*") && !password.Contains("(") && !password.Contains(")") && !password.Contains("-") && !password.Contains("_"))
                    return false;

                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool IsFirstnameLastnameValid(string firstname, string lastname)
        {
            try
            {
                if (firstname.Length >= 1 && firstname.Length <= 20 && firstname.Any(char.IsLetter)
                     && lastname.Length >= 1 && lastname.Length <= 20 && lastname.Any(char.IsLetter))
                    return true;

                return false;
            }
            catch
            {
                return false;
            }
        }

        public static bool IsUsernameValid(string username)
        {
            try
            {
                if (username.Length >= 1 && username.Length <= 30 && username.Any(char.IsLetterOrDigit))
                    return true;

                return false;
            }
            catch
            {
                return false;
            }
        }

        public static bool IsEmailValid(string email)
        {
            try
            {
                if (email.Length <= 30)
                {
                    EmailAddressAttribute e = new EmailAddressAttribute();
                    if (e.IsValid(email))
                        return true;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}
