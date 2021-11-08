using EPharm.Data;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EPharm.DataGenerator
{
    public class Generator
    {
        protected static readonly Logging Log = new("Generator");

        protected Random rnd = new Random(Guid.NewGuid().GetHashCode());
        public string GenerisiImeUlice()
        {
            List<string> prvaRec = new List<string>() { "Kralja", "Cara", "Heroja", "Kneza" };
            List<string> drugaRec = new List<string>() { "Milutina", "Dragutina", "Nemanje", "Stefana", "Dušana", "Uroša" };

            int broj = rnd.Next(1, 100);

            int prvaIndex = rnd.Next(0, prvaRec.Count);
            int drugaIndex = rnd.Next(0, drugaRec.Count);

            return $"{prvaRec[prvaIndex]} {drugaRec[drugaIndex]} {broj}";
        }


        public string GenerisiGrad()
        {
            List<string> gradovi = new List<string>() { "Subotica", "Beograd", "Kraljevo", "Kragujevac", "Sombor", "Bor", "Zaječar", "Niš", "Vranje", "Prizren", "Priština", "Preševo" };

            return gradovi[rnd.Next(0, gradovi.Count)];
        }

        public string GenerisiIme()
        {
            bool pol = rnd.Next(0, 10) % 2 == 0;

            string[] M_Ime = { "Dusan", "Jovan", "Marko", "Milos", "Branko", "Bekir", "Miroslav", "Mladen", "Vuk", "Mirko", "Stefan", "Almir" };
            string[] Z_Ime = { "Marija", "Anastasija", "Magdalena", "Tijana", "Teodora", "Mirjana", "Stefanija", "Sofija", "Verica", "Una", "Naida", "Emina" };
            string[] Prezime = { "Aleksic", "Brankovic", "Cvetkovic", "Hadzic", "Pjanic", "Modric", "Kovacevic", "Halilovic", "Lazarevic", "Lovric", "Mandic", "Nemanjic" };

            if (pol)
                return $"{M_Ime[rnd.Next(M_Ime.Length)]} {Prezime[rnd.Next(Prezime.Length)]}";
            else
                return $"{Z_Ime[rnd.Next(Z_Ime.Length)]} {Prezime[rnd.Next(Prezime.Length)]}";
        }


        public string GenerisiBrojTelefona()
        {
            int broj = rnd.Next(1000000, 99999999);

            return $"06{broj}";
        }

        public string GenerisiEmail(string ime, string prezime)
        {
            int broj = rnd.Next(1, 99999);

            return $"{ime.ToLower()}{prezime[0]}{broj}@gmail.com";
        }

        public int GenerisiSifruLeka()
        {
            int broj = rnd.Next(100000000, 999999999);

            return broj;
        }

        public DateTime GenerisiRandomDatum()
        {
            int godina = rnd.Next(2019, 2022);
            int mesec = rnd.Next(1, 13);
            int dan = rnd.Next(1, DateTime.DaysInMonth(godina, mesec) + 1);

            int sati = rnd.Next(0, 24);
            int minuti = rnd.Next(0, 60);
            int sekunde = rnd.Next(0, 60);

            return new DateTime(godina, mesec, dan, sati, minuti, sekunde);
        }

        public async Task GenerisiPodatke()
        {
            try
            {
                GeneratorApoteka ga = new GeneratorApoteka();
                await ga.GenerisiApoteke(50);

                GeneratorLekova genLekova = new GeneratorLekova();
                genLekova.GenerisiLekove();

                GeneratorKorisnika gk = new GeneratorKorisnika();
                await gk.GenerisiNoveKorisnike();

                GeneratorIzdavanjaLekova genIzdLekova = new GeneratorIzdavanjaLekova();
                await genIzdLekova.GenerisiIzdavanjeLekova(1000);
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }
        }
    }
}
