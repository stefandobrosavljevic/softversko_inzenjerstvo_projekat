using EPharm.Data;
using EPharm.Logic.Apoteke;
using EPharm.Logic.Lekovi;
using EPharm.Logic.Obavestenja;
using EPharm.Logic.Zaposleni;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace EPharm.Logic
{
    public static class LanacApoteka
    {
        private static readonly Logging Log = new Logging("LanacApoteka");

        public static readonly Dictionary<int, Apoteka> Apoteke = new Dictionary<int, Apoteka>();
        public static readonly Dictionary<int, Lek> BazaLekova = new Dictionary<int, Lek>();

        private static readonly string Verzija = "1.0";


        public static void UnhandledExceptionsHandler(object sender, UnhandledExceptionEventArgs args)
        {
            Exception ex = (Exception)args.ExceptionObject;
            Log.ExceptionTrace(ex, "UnhandledExceptionsHandler");
        }
        public static async Task UcitajPodatke()
        {
            AppDomain currentDomain = AppDomain.CurrentDomain;
            currentDomain.UnhandledException += new UnhandledExceptionEventHandler(UnhandledExceptionsHandler);

            using (StreamWriter sw = new StreamWriter("server_log.txt", true))
            {
                sw.WriteLine("\n\n\n");
                sw.WriteLine($"Aplikacija ePharm by DSoft, verzija {Verzija}");
                sw.WriteLine($"Datum kompajliranja: {new FileInfo(Assembly.GetExecutingAssembly().Location).LastWriteTime.ToString("dd/MM/yyyy HH':'mm':'ss")}");
                sw.WriteLine($"Vreme startovanja aplikacije: {DateTime.Now.ToString("dd/MM/yyyy HH':'mm':'ss")}");
                sw.WriteLine("\n\n\n");
                sw.Close();
            }

            Log.WriteLine("Sledi ucitavanje baze lekova...");
            await UcitajBazuLekova();
            Log.WriteLine("Sledi ucitavanje apoteka...");
            await UcitajApoteke();
            Log.WriteLine("Sledi ucitavanje lekova...");
            await Apoteka.UcitajLekove();
            Log.WriteLine("Sledi ucitavanje zaposlenih...");
            await Apoteka.UcitajZaposlene();
            Log.WriteLine("Sledi ucitavanje porudzbina...");
            await Apoteka.UcitajPorudzbine();
            Log.WriteLine("Sledi ucitavanje obavestenja...");
            await Poruka.UcitajPorukeObavestenja();
        }

        #region Apoteke
        public static async Task UcitajApoteke()
        {
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync("SELECT * FROM `apoteke`");

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        int ID = Convert.ToInt32(row["ID"]);
                        string adresa = Convert.ToString(row["Adresa"]);
                        string grad = Convert.ToString(row["Grad"]);
                        string telefon = Convert.ToString(row["Telefon"]);

                        Apoteka apoteka = new Apoteka(ID, adresa, grad, telefon);
                        Apoteke.Add(ID, apoteka);
                    }
                    Log.WriteLine($"Uspesno je ucitano {Apoteke.Count} apoteka!", Logging.Type.Success);
                }
                else
                    Log.WriteLine($"Tabela `apoteke` nije vratila podatke.", Logging.Type.Warning);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
        }
        public static async Task KreirajApoteku(Apoteka ap)
        {
            try
            {
                int newId = 1;
                while (Apoteke.ContainsKey(newId)) newId++;
                ap.ID = newId;
                Apoteke.Add(newId, ap);
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "INSERT INTO `apoteke` VALUES (@id, @adresa, @grad, @telefon)";
                cmd.Parameters.AddWithValue("@id", ap.ID);
                cmd.Parameters.AddWithValue("@adresa", ap.Adresa);
                cmd.Parameters.AddWithValue("@grad", ap.Grad);
                cmd.Parameters.AddWithValue("@telefon", ap.Telefon);
                await MySQL.DB.QueryAsync(cmd);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
        }
        public static async Task<bool> ObrisiApoteku(int id)
        {
            try
            {
                if (Apoteke.ContainsKey(id))
                {
                    Apoteke.Remove(id);
                    MySqlCommand cmd = new MySqlCommand();
                    cmd.CommandText = "DELETE FROM `apoteke` WHERE ID = @id";
                    cmd.Parameters.AddWithValue("@id", id);
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

        #region Baza lekova
        public static async Task UcitajBazuLekova()
        {
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync("SELECT * FROM `lekovi`");

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        int sifra = Convert.ToInt32(row["Sifra"]);
                        string ime = Convert.ToString(row["Ime"]);
                        string opis = Convert.ToString(row["Opis"]);
                        string slika = Convert.ToString(row["Slika"]);
                        short cena = Convert.ToInt16(row["Cena"]);
                        short brTabli = Convert.ToInt16(row["BrojTabli"]);

                        Lek lek = new Lek(sifra, ime, opis, slika, cena, brTabli);
                        BazaLekova.Add(sifra, lek);
                    }
                    Log.WriteLine($"Baza lekova uspesno ucitana! Ucitano je {BazaLekova.Count} lekova!", Logging.Type.Success);
                }
                else
                    Log.WriteLine($"Tabela `lekovi` nije vratila podatke.", Logging.Type.Warning);


            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
        }

        public static List<ALek> VratiParalelneLekove(Apoteka apoteka, int sifraLeka)
        {
            List<ALek> paralelniLekovi = new();

            foreach (var kvp in Apoteke)
            {
                Apoteka ap = kvp.Value;
                if (ap != apoteka && ap.Grad == apoteka.Grad)
                {
                    ALek lek = ap.Lekovi.FirstOrDefault(l => l.PodaciLeka.Sifra == sifraLeka);
                    if (lek != null)
                        paralelniLekovi.Add(lek);
                }
            }

            return paralelniLekovi;
        }

        public static async Task KreirajLekUBazi(ALek aLek)
        {
            try
            {
                Lek lek = aLek.PodaciLeka;
                Random rnd = new Random();
                int novaSifra = lek.Sifra >= 100000000 && lek.Sifra <= 999999999 ? lek.Sifra : rnd.Next(100000000, 999999999);
                string slika = lek.Slika.Contains(".png") ? lek.Slika : "default.png";
                while (BazaLekova.ContainsKey(novaSifra)) novaSifra = rnd.Next(100000000, 999999999);
                lek.Sifra = novaSifra;
                BazaLekova.Add(novaSifra, lek);
                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "INSERT INTO `lekovi` VALUES (@sifra, @ime, @opis, @cena, @brTabli, @slika)";
                cmd.Parameters.AddWithValue("@sifra", lek.Sifra);
                cmd.Parameters.AddWithValue("@ime", lek.Ime);
                cmd.Parameters.AddWithValue("@opis", lek.Opis);
                cmd.Parameters.AddWithValue("@cena", lek.Cena);
                cmd.Parameters.AddWithValue("@brTabli", lek.BrojTabli);
                cmd.Parameters.AddWithValue("@slika", slika);
                await MySQL.DB.QueryAsync(cmd);


                cmd = new MySqlCommand();
                cmd.CommandText = "INSERT INTO `apoteke_lekovi` VALUES (@sifra, @apoteka, @kolicina, @kritKol, @deljiv)";
                cmd.Parameters.AddWithValue("@kolicina", aLek.Kolicina);
                cmd.Parameters.AddWithValue("@kritKol", aLek.KriticnaKolicina);
                cmd.Parameters.AddWithValue("@deljiv", aLek.Deljiv);
                cmd.Parameters.AddWithValue("@sifra", lek.Sifra);
                cmd.Parameters.AddWithValue("@apoteka", 1);
                foreach (var kvp in Apoteke)
                {
                    Apoteka ap = kvp.Value;
                    ap.Lekovi.Add(new ALek(aLek.Kolicina, aLek.KriticnaKolicina, aLek.Deljiv, ap, lek));
                    cmd.Parameters["@apoteka"].Value = ap.ID;
                    await MySQL.DB.QueryAsync(cmd);
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
        }
        public static async Task<bool> ObrisiLekIzBaze(int sifra)
        {
            try
            {
                if (BazaLekova.TryGetValue(sifra, out Lek lek))
                {
                    // Brisanje datog leka iz svih apoteka, jer on vise ne postoji u bazi lekova (npr. izbacen iz prodaje)
                    foreach (var kvp in Apoteke)
                    {
                        foreach (ALek aLek in kvp.Value.Lekovi.ToList())
                        {
                            if (aLek.PodaciLeka == lek)
                            {
                                kvp.Value.Lekovi.Remove(aLek);
                            }
                        }
                    }
                    BazaLekova.Remove(sifra);
                    MySqlCommand cmd = new MySqlCommand();
                    cmd.CommandText = "DELETE FROM `lekovi` WHERE Sifra = @sifra"; // Kada se obrise iz tabele `lekovi`, DBMS ce se pobrinuti da se obrise i iz tabele apoteke_lekovi
                    cmd.Parameters.AddWithValue("@sifra", sifra);
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

        public static Korisnik PronadjiZaposlenog(string username)
        {
            foreach (var kvp in LanacApoteka.Apoteke)
            {
                foreach (Korisnik radnik in kvp.Value.Zaposleni)
                {
                    if (radnik.Username == username)
                        return radnik;
                }
            }
            return null;
        }
    }
}
