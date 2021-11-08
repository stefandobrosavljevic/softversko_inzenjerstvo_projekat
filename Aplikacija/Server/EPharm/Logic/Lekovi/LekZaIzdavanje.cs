using Newtonsoft.Json;

namespace EPharm.Logic.Lekovi
{
    public class LekZaIzdavanje
    {
        public int Sifra { get; set; }
        public short Kolicina { get; set; }
        public bool IzdavanjePoTabli { get; set; }
        [JsonIgnore] public ALek ALek { get; set; }
        [JsonIgnore] public float KolicinaZaIzdavanje { get; set; }
        public LekZaIzdavanje(int sifra, short kolicina, bool izdavanjePoTabli)
        {
            Sifra = sifra;
            Kolicina = kolicina;
            IzdavanjePoTabli = izdavanjePoTabli;
        }
    }
}
