using EPharm.Logic;
using EPharm.Logic.Apoteke;
using System.Threading.Tasks;

namespace EPharm.DataGenerator
{
    public class GeneratorApoteka : Generator
    {
        public async Task GenerisiApoteke(int br)
        {
            for (int i = 0; i < br; i++)
            {
                string adresa = GenerisiImeUlice();
                string grad = GenerisiGrad();
                string brojTelefona = GenerisiBrojTelefona();

                Apoteka ap = new Apoteka(-1, adresa, grad, brojTelefona);
                await LanacApoteka.KreirajApoteku(ap);
            }
        }
    }
}
