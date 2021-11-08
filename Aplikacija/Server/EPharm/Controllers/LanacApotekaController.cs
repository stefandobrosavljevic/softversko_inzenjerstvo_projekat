using EPharm.Logic;
using EPharm.Logic.Apoteke;
using EPharm.Logic.Statistika;
using EPharm.Logic.Zaposleni;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EPharm.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class LanacApotekaController : ControllerBase
    {
        #region Apoteke
        [Authorize(Roles = "Vlasnik")]
        [HttpGet("VratiApoteke")]
        public IEnumerable<Apoteka> VratiListuApoteka()
        {
            return LanacApoteka.Apoteke.Values.ToList();
        }

        [Authorize(Roles = "Vlasnik")]
        [HttpPut("AzurirajApoteku/{id}")]
        public async Task<IActionResult> AzurirajApoteku(int id, [FromBody] Apoteka noviPodaci)
        {
            if (!LanacApoteka.Apoteke.TryGetValue(id, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {id} ne postoji." });

            if (noviPodaci.Adresa.Length < 1 || noviPodaci.Adresa.Length > 30)
                return BadRequest(new { message = $"Minimalan broj karaktera za adresu apoteke je 1, maksimalan 30!" });

            if (noviPodaci.Grad.Length < 1 || noviPodaci.Grad.Length > 30)
                return BadRequest(new { message = $"Minimalan broj karaktera za grad apoteke je 1, maksimalan 30!" });

            if (!Apoteka.IsPhoneNumberValid(noviPodaci.Telefon))
                return BadRequest(new { message = $"Niste uneli validan broj telefona!" });

            ap.Adresa = noviPodaci.Adresa;
            ap.Grad = noviPodaci.Grad;
            ap.Telefon = noviPodaci.Telefon;
            await ap.SacuvajPodatke();

            return Ok(ap);
        }

        [Authorize(Roles = "Vlasnik")]
        [HttpPost("KreirajApoteku")]
        public async Task<IActionResult> KreirajApoteku([FromBody] Apoteka ap)
        {
            if (ap.Adresa.Length < 1 || ap.Adresa.Length > 30)
                return BadRequest(new { message = $"Minimalan broj karaktera za adresu apoteke je 1, maksimalan 30!" });

            if (ap.Grad.Length < 1 || ap.Grad.Length > 30)
                return BadRequest(new { message = $"Minimalan broj karaktera za grad apoteke je 1, maksimalan 30!" });

            if (!Apoteka.IsPhoneNumberValid(ap.Telefon))
                return BadRequest(new { message = $"Niste uneli validan broj telefona!" });

            await LanacApoteka.KreirajApoteku(ap);
            return Ok(LanacApoteka.Apoteke);
        }

        [Authorize(Roles = "Vlasnik")]
        [HttpDelete("ObrisiApoteku/{id}")]
        public async Task<IActionResult> ObrisiApoteku(int id)
        {
            if (!await LanacApoteka.ObrisiApoteku(id))
                return BadRequest(new { message = $"Apoteka {id} ne postoji ili je došlo do greške." });

            return Ok(LanacApoteka.Apoteke);
        }
        #endregion

        #region Baza lekova
        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpDelete("ObrisiLekIzBaze/{sifra}")]
        public async Task<IActionResult> ObrisiLekIzBaze(int sifra)
        {
            if (!await LanacApoteka.ObrisiLekIzBaze(sifra))
                return BadRequest(new { message = $"Lek sa šifrom {sifra} ne postoji u bazi lekova ili je došlo do greške." });

            return Ok(LanacApoteka.BazaLekova);
        }
        #endregion

        #region Zaposleni
        [Authorize(Roles = "Vlasnik")]
        [HttpGet("VratiZaposlene")]
        public IEnumerable<Korisnik> VratiZaposleneUSvimApotekama()
        {
            List<Korisnik> zaposleni = new List<Korisnik>();

            foreach (var kvp in LanacApoteka.Apoteke)
            {
                zaposleni.AddRange(kvp.Value.Zaposleni);
            }

            return zaposleni;
        }
        #endregion

        #region Statistika
        [Authorize(Roles = "Vlasnik")]
        [HttpGet("VratiPrihodePoApotekama/{brMeseci}")]
        public async Task<IActionResult> VratiPrihodePoApotekama(short brMeseci)
        {
            var prihodi = await StatistikaLanca.VratiPrihodePoApotekama(brMeseci);
            return Ok(prihodi);
        }


        [Authorize(Roles = "Vlasnik")]
        [HttpGet("VratiNajprodavanijeLekove/{brLekova}")]
        public async Task<IActionResult> VratiNajprodavanijeLekove(short brLekova)
        {
            var data = await StatistikaLanca.VratiNajprodavanijeLekove(brLekova);
            return Ok(data);
        }


        [Authorize(Roles = "Vlasnik")]
        [HttpGet("VratiPrihodePoMesecimaZaSveApoteke/{brMeseci}")]
        public async Task<IActionResult> VratiPrihodePoMesecimaZaSveApoteke(short brMeseci)
        {
            var data = await StatistikaApoteke.VratiPrihodePoMesecima(null, brMeseci);
            return Ok(data);
        }

        [Authorize(Roles = "Vlasnik")]
        [HttpGet("VratiBrojProdajaPoMesecimaZaSveApoteke/{brMeseci}")]
        public async Task<IActionResult> VratiBrojProdajaPoMesecimaZaSveApoteke(short brMeseci)
        {
            var data = await StatistikaLanca.VratiBrojProdajaPoMesecima(brMeseci);
            return Ok(data);
        }
        #endregion
    }
}
