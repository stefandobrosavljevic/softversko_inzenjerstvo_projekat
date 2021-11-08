using EPharm.Data;
using EPharm.Logic;
using EPharm.Logic.Apoteke;
using EPharm.Logic.Extensions;
using EPharm.Logic.Lekovi;
using EPharm.Logic.Porudzbine;
using EPharm.Logic.Statistika;
using EPharm.Logic.Zaposleni;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace EPharm.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ApotekaController : ControllerBase
    {
        private static readonly Logging Log = new Logging("ApotekaController");

        #region Zaposleni
        [Authorize(Roles = "Vlasnik,Upravnik")]
        [HttpGet("VratiZaposlene/{idApoteke}")]
        public IActionResult VratiZaposlene(int idApoteke)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            return Ok(ap.Zaposleni);
        }

        [Authorize(Roles = "Vlasnik,Upravnik")]
        [HttpPut("AzurirajZaposlenog/{idApoteke}/{username}")]
        public async Task<IActionResult> AzurirajZaposlenog(int idApoteke, string username, [FromBody] Korisnik noviPodaci)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            Korisnik zaposleni = ap.Zaposleni.FirstOrDefault(z => z.Username == username);
            if (zaposleni == null)
                return BadRequest(new { message = $"Zaposleni sa korisničkim imenom {username} nije pronađen." });

            if (!Korisnik.IsEmailValid(noviPodaci.Email))
                return BadRequest(new { message = $"Niste uneli validnu email adresu!" });

            if (!Apoteka.IsPhoneNumberValid(noviPodaci.Telefon))
                return BadRequest(new { message = $"Niste uneli validan broj telefona!" });

            if (!Korisnik.IsFirstnameLastnameValid(noviPodaci.Ime, noviPodaci.Prezime))
                return BadRequest(new { message = $"Niste uneli validno ime i/ili prezime!" });

            await zaposleni.AzurirajPodatke(noviPodaci);
            return Ok(zaposleni);
        }

        [Authorize(Roles = "Vlasnik,Upravnik")]
        [HttpPost("KreirajZaposlenog/{idApoteke}/{password}")]
        public async Task<IActionResult> KreirajZaposlenog(int idApoteke, string password, [FromBody] Korisnik noviZaposleni)
        {

            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            if (!Korisnik.IsUsernameValid(noviZaposleni.Username))
                return BadRequest(new { message = $"Niste uneli validno korisničko ime!" });

            Korisnik zaposleni = LanacApoteka.PronadjiZaposlenog(noviZaposleni.Username);
            if (zaposleni != null)
                return BadRequest(new { message = $"Zaposleni sa korisničkim imenom {noviZaposleni.Username} vec postoji!" });

            if (!Korisnik.IsPasswordValid(password))
                return BadRequest(new { message = $"Lozinka mora da sadrži bar jedno veliko, malo slovo, broj i bar jedan karakter! Može da sadrži minimalno 5, maksimalno 30 karaktera." });

            if (!Korisnik.IsEmailValid(noviZaposleni.Email))
                return BadRequest(new { message = $"Niste uneli validnu email adresu!" });

            if (!Apoteka.IsPhoneNumberValid(noviZaposleni.Telefon))
                return BadRequest(new { message = $"Niste uneli validan broj telefona!" });

            if (!Korisnik.IsFirstnameLastnameValid(noviZaposleni.Ime, noviZaposleni.Prezime))
                return BadRequest(new { message = $"Niste uneli validno ime i/ili prezime!" });

            await ap.KreirajZaposlenog(noviZaposleni, password);
            return Ok(ap.Zaposleni);
        }

        [Authorize(Roles = "Vlasnik,Upravnik")]
        [HttpDelete("ObrisiZaposlenog/{idApoteke}/{username}")]
        public async Task<IActionResult> ObrisiZaposlenog(int idApoteke, string username)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            if (!await ap.ObrisiZaposlenog(username))
                return BadRequest(new { message = $"Zaposleni sa korisničkim imenom {username} nije pronađen ili je došlo do greške." });

            return Ok(ap.Zaposleni);
        }
        #endregion

        #region Lekovi
        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut,FarmTehnicar")]
        [HttpGet("VratiALekove/{idApoteke}")]
        public IActionResult VratiALekove(int idApoteke)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            return Ok(ap.Lekovi);
        }
        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpPut("AzurirajLek/{idApoteke}/{sifra}")]
        public async Task<IActionResult> AzurirajLek(int idApoteke, int sifra, [FromBody] ALek noviPodaci)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            ALek lek = ap.Lekovi.FirstOrDefault(z => z.PodaciLeka.Sifra == sifra);
            if (lek == null)
                return BadRequest(new { message = $"Lek sa šifrom {sifra} nije pronađen." });

            if (!ALek.DaLiJeKolicinaValidna(noviPodaci.Kolicina, noviPodaci.Deljiv) || !ALek.DaLiJeKolicinaValidna(noviPodaci.KriticnaKolicina, false))
                return BadRequest(new { message = $"Niste uneli validnu količinu i/ili kritičnu količinu leka!" });

            if (noviPodaci.PodaciLeka.Ime.Length < 1 || noviPodaci.PodaciLeka.Ime.Length > 50)
                return BadRequest(new { message = $"Minimalan broj karaktera za ime leka je 1, maksimalan 50!" });

            if (noviPodaci.PodaciLeka.Opis.Length > 100)
                return BadRequest(new { message = $"Maksimalan broj karaktera za opis leka je 100!" });

            if (noviPodaci.PodaciLeka.Cena < 1)
                return BadRequest(new { message = $"Cena leka mora biti veća od 0!" });

            if (noviPodaci.PodaciLeka.BrojTabli < 2 && noviPodaci.Deljiv || noviPodaci.PodaciLeka.BrojTabli < 0)
                return BadRequest(new { message = $"Broj tabli u kutiji mora biti veći od 1 ukoliko je lek deljiv ili minimalno 0 ukoliko lek nije deljiv!" });

            await lek.AzurirajPodatke(noviPodaci);
            return Ok(lek);
        }

        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpPost("KreirajLek")]
        public async Task<IActionResult> KreirajLek([FromBody] ALek lek)
        {
            if (!ALek.DaLiJeKolicinaValidna(lek.Kolicina, lek.Deljiv) || !ALek.DaLiJeKolicinaValidna(lek.KriticnaKolicina, false))
                return BadRequest(new { message = $"Niste uneli validnu količinu i/ili kritičnu količinu leka!" });

            if (lek.PodaciLeka.Ime.Length < 1 || lek.PodaciLeka.Ime.Length > 50)
                return BadRequest(new { message = $"Minimalan broj karaktera za ime leka je 1, maksimalan 50!" });

            if (lek.PodaciLeka.Opis.Length > 100)
                return BadRequest(new { message = $"Maksimalan broj karaktera za opis leka je 100!" });

            if (lek.PodaciLeka.Cena < 1)
                return BadRequest(new { message = $"Cena leka mora biti veća od 0!" });

            if (lek.PodaciLeka.BrojTabli < 2 && lek.Deljiv || lek.PodaciLeka.BrojTabli < 0)
                return BadRequest(new { message = $"Broj tabli u kutiji mora biti veći od 1 ukoliko je lek deljiv ili minimalno 0 ukoliko lek nije deljiv!" });

            await LanacApoteka.KreirajLekUBazi(lek);
            return Ok(lek);
        }

        // Brisanje leka je na nivou svih apoteka, nalazi se u LanacApoteka kontroleru


        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut,FarmTehnicar")]
        [HttpGet("VratiParalelneLekove/{sifraLeka}")]
        public IActionResult VratiParalelneLekove(int sifraLeka)
        {
            Korisnik korisnik = HttpContext.GetUserObject();
            if (korisnik == null)
                return BadRequest(new { message = $"Greška prilikom potvrde identiteta!" });

            var listaParalelnihLekova = LanacApoteka.VratiParalelneLekove(korisnik.Apoteka, sifraLeka);
            return Ok(listaParalelnihLekova);
        }
        #endregion

        #region Porudzbine
        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpGet("VratiPorudzbine/{idApoteke}")]
        public IActionResult VratiPorudzbine(int idApoteke)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            return Ok(ap.Porudzbine);
        }
        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpPost("KreirajPorudzbinu/{idApoteke}")]
        public async Task<IActionResult> KreirajPorudzbinu(int idApoteke, [FromBody] Porudzbina porudzbina)
        {
            Korisnik korisnik = HttpContext.GetUserObject();
            if (korisnik == null)
                return BadRequest(new { message = $"Greška prilikom potvrde identiteta!" });

            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            PoruceniLek pLek = porudzbina.PoruceniLekovi.FirstOrDefault(l => l.Kolicina < 1);
            if (pLek != null)
                return BadRequest(new { message = $"Uneli ste nevalidnu količinu za poručeni lek sa šifrom {pLek.SifraLeka}." });

            porudzbina.Kreirao = korisnik.Username;
            await ap.KreirajPorudzbinu(porudzbina);
            return Ok(ap.Porudzbine);
        }
        [Authorize(Roles = "Vlasnik,Upravnik")]
        [HttpPut("PotvrdiPorudzbinu/{idApoteke}/{idPorudzbine}")]
        public async Task<IActionResult> PotvrdiPorudzbinu(short idApoteke, int idPorudzbine)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            Porudzbina porudzbina = ap.Porudzbine.FirstOrDefault(z => z.ID == idPorudzbine);
            if (porudzbina == null)
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} nije pronađena." });

            if (!string.IsNullOrEmpty(porudzbina.Potvrdio))
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} je već potvrđena." });

            if (porudzbina.PoruceniLekovi.Count < 1)
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} nema nijedan poručeni lek, ne može biti potvrđena." });

            await porudzbina.PotvrdiPorudzbinu(this.User.Identity.Name);
            return Ok(porudzbina);
        }
        [Authorize(Roles = "Vlasnik,Upravnik")]
        [HttpDelete("ObrisiPorudzbinu/{idApoteke}/{idPorudzbine}")]
        public async Task<IActionResult> ObrisiPorudzbinu(int idApoteke, int idPorudzbine)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            Porudzbina porudzbina = ap.Porudzbine.FirstOrDefault(z => z.ID == idPorudzbine);
            if (porudzbina == null)
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} nije pronađena." });

            await ap.ObrisiPorudzbinu(porudzbina);
            return Ok(ap.Porudzbine);
        }


        #region Izmena porudzbine
        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpPost("DodajLekUPorudzbinu/{idApoteke}/{idPorudzbine}/{sifraLeka}/{kolicina}")]
        public async Task<IActionResult> DodajLekUPorudzbinu(short idApoteke, int idPorudzbine, int sifraLeka, short kolicina)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            Porudzbina porudzbina = ap.Porudzbine.FirstOrDefault(z => z.ID == idPorudzbine);
            if (porudzbina == null)
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} nije pronađena." });

            if (!string.IsNullOrEmpty(porudzbina.Potvrdio))
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} je potvrđena, ne možete je korigovati!" });

            PoruceniLek p = porudzbina.PoruceniLekovi.FirstOrDefault(l => l.Podaci.Sifra == sifraLeka);
            if (p != null)
                return BadRequest(new { message = $"Izabrani lek sa šifrom {sifraLeka} se već nalazi u izabranoj porudžbini!" });

            if (!LanacApoteka.BazaLekova.TryGetValue(sifraLeka, out Lek podaciLeka))
                return BadRequest(new { message = $"Lek sa šifrom {sifraLeka} ne postoji u bazi lekova." });

            if (kolicina < 1)
                return BadRequest(new { message = $"Uneli ste nevalidnu količinu za poručeni lek sa šifrom {sifraLeka}." });


            await porudzbina.DodajPoruceniLek(sifraLeka, kolicina, podaciLeka);
            return Ok(porudzbina);
        }
        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpPut("IzmeniKolicinuPorucenogLeka/{idApoteke}/{idPorudzbine}/{sifraLeka}/{kolicina}")]
        public async Task<IActionResult> IzmeniKolicinuPorucenogLeka(int idApoteke, int idPorudzbine, int sifraLeka, short kolicina)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            Porudzbina porudzbina = ap.Porudzbine.FirstOrDefault(z => z.ID == idPorudzbine);
            if (porudzbina == null)
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} nije pronađena." });

            if (!string.IsNullOrEmpty(porudzbina.Potvrdio))
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} je potvrđena, ne možete je korigovati!" });

            PoruceniLek poruceniLek = porudzbina.PoruceniLekovi.FirstOrDefault(l => l.Podaci.Sifra == sifraLeka);
            if (poruceniLek == null)
                return BadRequest(new { message = $"Izabrani lek sa šifrom {sifraLeka} nije pronađen u izabranoj porudžbini!" });

            if (kolicina < 1)
                return BadRequest(new { message = $"Uneli ste nevalidnu količinu za poručeni lek sa šifrom {sifraLeka}." });

            await poruceniLek.IzmeniKolicinu(kolicina);
            return Ok(poruceniLek);
        }

        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpDelete("ObrisiLekIzPorudzbine/{idApoteke}/{idPorudzbine}/{sifraLeka}")]
        public async Task<IActionResult> ObrisiLekIzPorudzbine(int idApoteke, int idPorudzbine, int sifraLeka)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            Porudzbina porudzbina = ap.Porudzbine.FirstOrDefault(z => z.ID == idPorudzbine);
            if (porudzbina == null)
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} nije pronađena." });

            if (!string.IsNullOrEmpty(porudzbina.Potvrdio))
                return BadRequest(new { message = $"Porudžbina ID: {idPorudzbine} je potvrđena, ne možete je korigovati!" });

            PoruceniLek poruceniLek = porudzbina.PoruceniLekovi.FirstOrDefault(l => l.Podaci.Sifra == sifraLeka);
            if (poruceniLek == null)
                return BadRequest(new { message = $"Izabrani lek sa šifrom {sifraLeka} nije pronađen u izabranoj porudžbini!" });

            await porudzbina.ObrisiPoruceniLek(poruceniLek);
            return Ok(porudzbina);
        }
        #endregion
        #endregion

        #region Statistika
        [Authorize(Roles = "Vlasnik")]
        [HttpGet("VratiPrihodePoMesecima/{idApoteke}/{brMeseci}")]
        public async Task<IActionResult> VratiPrihodePoMesecima(int idApoteke, short brMeseci)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            var statistika = await StatistikaApoteke.VratiPrihodePoMesecima(ap, brMeseci);
            return Ok(statistika);
        }

        [Authorize(Roles = "Vlasnik")]
        [HttpGet("VratiBrojProdatihLekovaPoMesecima/{idApoteke}/{brMeseci}")]
        public async Task<IActionResult> VratiBrojProdatihLekovaPoMesecima(int idApoteke, short brMeseci)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(idApoteke, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {idApoteke} ne postoji." });

            var data = await StatistikaApoteke.VratiBrojProdatihLekovaPoMesecima(ap, brMeseci);
            return Ok(data);
        }
        #endregion
    }
}
