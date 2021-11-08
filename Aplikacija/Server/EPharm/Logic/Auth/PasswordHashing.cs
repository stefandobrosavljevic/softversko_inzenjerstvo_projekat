using System;
using System.Security.Cryptography;
using System.Text;

namespace EPharm.Logic.Auth
{
    public static class PasswordHashing
    {
        private static string GenerateHash(byte[] bytesToHash, byte[] salt)
        {
            var byteResult = new Rfc2898DeriveBytes(bytesToHash, salt, 10000);
            return Convert.ToBase64String(byteResult.GetBytes(24));
        }

        private static string GenerateSalt()
        {
            var bytes = new byte[16];
            var rng = new RNGCryptoServiceProvider();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        public static Tuple<string, string> HashNewPassword(string password)
        {
            string salt = GenerateSalt();
            string hashedPassword = GenerateHash(Encoding.UTF8.GetBytes(password), Encoding.UTF8.GetBytes(salt));
            return new Tuple<string, string>(hashedPassword, salt);
        }

        public static string HashPassword(string password, string salt)
        {
            string hashedPassword = GenerateHash(Encoding.UTF8.GetBytes(password), Encoding.UTF8.GetBytes(salt));
            return hashedPassword;
        }
    }
}
