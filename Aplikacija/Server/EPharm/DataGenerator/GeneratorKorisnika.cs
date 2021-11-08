using EPharm.Logic;
using EPharm.Logic.Apoteke;
using EPharm.Logic.Zaposleni;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace EPharm.DataGenerator
{
    public class GeneratorKorisnika : Generator
    {
        public async Task GenerisiNoveKorisnike()
        {
            foreach (Apoteka ap in LanacApoteka.Apoteke.Values.ToList())
            {
                for (int i = 1; i <= 3; i++)
                {
                    string generisanoIme = GenerisiIme();
                    string lozinka = generisanoIme + "123!@Ab";
                    string username = $"{generisanoIme.Replace(" ", "")}{rnd.Next(1, 100)}";
                    string[] imePrez = generisanoIme.Split(" ");
                    string brTelefona = GenerisiBrojTelefona();
                    string email = GenerisiEmail(imePrez[0], imePrez[1]);
                    Uloge uloga = (Uloge)i;

                    Korisnik korisnik = new(username, lozinka, "", imePrez[0], imePrez[1], email, brTelefona, ap, uloga);
                    await ap.KreirajZaposlenog(korisnik, lozinka);

                    rnd = new Random(Guid.NewGuid().GetHashCode());
                }
            }

        }
    }
}
