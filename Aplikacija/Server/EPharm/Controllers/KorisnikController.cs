using EPharm.Logic;
using EPharm.Logic.Apoteke;
using EPharm.Logic.Extensions;
using EPharm.Logic.Lekovi;
using EPharm.Logic.Obavestenja;
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
    public class KorisnikController : ControllerBase
    {
        #region Obavestenja
        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpPut("PogledajObavestenje/{idObavestenja}")]
        public async Task<IActionResult> PogledajObavestenje(int idObavestenja)
        {
            Korisnik korisnik = HttpContext.GetUserObject();
            if (korisnik == null)
                return BadRequest(new { message = $"Greška prilikom potvrde identiteta!" });

            Obavestenje obavestenje = korisnik.Obavestenja.FirstOrDefault(o => o.Poruka.ID == idObavestenja);
            if (obavestenje == null)
                return BadRequest(new { message = $"Obavestenje {idObavestenja} nije pronađeno." });


            await obavestenje.PromeniStatus(StatusObavestenja.PREGLEDANO);
            return Ok(obavestenje);
        }

        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut")]
        [HttpDelete("ObrisiObavestenje/{idObavestenja}")]
        public async Task<IActionResult> ObrisiObavestenje(int idObavestenja)
        {
            Korisnik korisnik = HttpContext.GetUserObject();
            if (korisnik == null)
                return BadRequest(new { message = $"Greška prilikom potvrde identiteta!" });

            Obavestenje obavestenje = korisnik.Obavestenja.FirstOrDefault(o => o.Poruka.ID == idObavestenja);
            if (obavestenje == null)
                return BadRequest(new { message = $"Obavestenje {idObavestenja} nije pronađeno." });


            await obavestenje.PromeniStatus(StatusObavestenja.OBRISANO);
            return Ok(obavestenje);
        }
        #endregion


        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut,FarmTehnicar")]
        [HttpPost("IzdajLekove")]
        public async Task<IActionResult> IzdajLekove([FromBody] List<LekZaIzdavanje> lekoviZaIzdavanje)
        {
            Korisnik korisnik = HttpContext.GetUserObject();
            if (korisnik == null)
                return BadRequest(new { message = $"Greška prilikom potvrde identiteta!" });


            string greska = await korisnik.IzdajLekove(lekoviZaIzdavanje);
            if (greska.Length > 0)
                return BadRequest(new { message = greska });

            return Ok(new { message = "Lekovi uspešno izdati!" });
        }


        [Authorize(Roles = "Vlasnik,Upravnik,Farmaceut,FarmTehnicar")]
        [HttpPut("IzmeniLicniNalog")]
        public async Task<IActionResult> IzmeniLicniNalog([FromBody] IzmenaPodatakaModel podaci)
        {
            Korisnik korisnik = HttpContext.GetUserObject();
            if (korisnik == null)
                return BadRequest(new { message = $"Greška prilikom potvrde identiteta!" });

            string greska = await korisnik.IzmeniNalog(podaci.Lozinka, podaci.Email, podaci.Telefon);
            if (greska.Length > 0)
                return BadRequest(new { message = greska });

            return Ok(korisnik);
        }

        [Authorize(Roles = "Vlasnik")]
        [HttpPut("IzmeniIzabranuApoteku/{id}")]
        public async Task<IActionResult> IzmeniIzabranuApoteku(int id)
        {
            Korisnik korisnik = HttpContext.GetUserObject();
            if (korisnik == null)
                return BadRequest(new { message = $"Greška prilikom potvrde identiteta!" });

            if (!LanacApoteka.Apoteke.TryGetValue(id, out Apoteka ap))
                return BadRequest(new { message = $"Apoteka {id} ne postoji." });

            if (!await korisnik.IzmeniApoteku(ap))
                return BadRequest(new { message = $"Došlo je do greške prilikom izmene izabrane apoteke korisnika." });

            return Ok(korisnik);
        }
    }
}
