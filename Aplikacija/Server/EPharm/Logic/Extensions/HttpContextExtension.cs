using EPharm.Logic.Zaposleni;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace EPharm.Logic.Extensions
{
    public static class HttpContextExtension
    {
        public static Korisnik GetUserObject(this HttpContext context)
        {
            if (context == null)
                return null;

            Korisnik korisnik = LanacApoteka.PronadjiZaposlenog(context.User?.FindFirstValue(ClaimTypes.NameIdentifier));
            return korisnik;
        }
    }
}
