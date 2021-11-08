using EPharm.Data;
using EPharm.Logic.Zaposleni;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EPharm.Logic.Auth.Services
{
    public interface IUserService
    {
        Korisnik Authenticate(string username, string password);
    }

    public class UserService : IUserService
    {
        private static readonly Logging Log = new Logging("UserService");
        private static readonly Dictionary<string, Korisnik> _zaposleniCache = new Dictionary<string, Korisnik>();
        public Korisnik UlogujZaposlenog(string username, string password)
        {
            lock (_zaposleniCache)
            {
                if (_zaposleniCache.TryGetValue(username, out Korisnik kor))
                {
                    if (kor.CheckPassword(password))
                        return kor;
                }
                else
                {
                    try
                    {
                        Korisnik zaposleni = LanacApoteka.PronadjiZaposlenog(username);

                        if (zaposleni != null)
                        {

                            _zaposleniCache.Add(username, zaposleni);

                            if (zaposleni.CheckPassword(password))
                                return zaposleni;
                        }
                    }
                    catch (Exception ex)
                    {
                        Log.ExceptionTrace(ex);
                    }
                }
            }

            return null;
        }

        public Korisnik Authenticate(string username, string password)
        {
            var user = UlogujZaposlenog(username, password);

            Log.WriteLine($"Username: {username}, postoji: {user != null}");

            return user;
        }

    }
}