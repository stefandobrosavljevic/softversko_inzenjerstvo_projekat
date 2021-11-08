using EPharm.Data;
using EPharm.Logic;
using EPharm.Logic.Apoteke;
using EPharm.Logic.Lekovi;
using MySqlConnector;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EPharm.DataGenerator
{
    public class GeneratorIzdavanjaLekova : Generator
    {
        public async Task GenerisiIzdavanjeLekova(int brIzdavanja)
        {

            List<Apoteka> listaApoteka = LanacApoteka.Apoteke.Values.ToList();
            List<Lek> listaLekova = LanacApoteka.BazaLekova.Values.ToList();


            for (int i = 0; i < brIzdavanja; i++)
            {
                Apoteka ap = listaApoteka[rnd.Next(0, listaApoteka.Count)];
                int brLekova = rnd.Next(1, 10);

                List<Lek> lekoviZaIzdavanje = new List<Lek>(brLekova);
                for (int j = 0; j < brLekova; j++)
                    lekoviZaIzdavanje.Add(listaLekova[rnd.Next(0, listaLekova.Count)]);



                MySqlCommand cmd = new MySqlCommand();
                cmd.CommandText = "INSERT INTO `log_izdavanje_lekova`(`Zaposleni`, `Apoteka`, `Datum`) VALUES (@zaposleni, @apoteka, @datum)";
                cmd.Parameters.AddWithValue("@zaposleni", GenerisiIme());
                cmd.Parameters.AddWithValue("@apoteka", ap.ID);
                cmd.Parameters.AddWithValue("@datum", MySQL.ConvertTime(GenerisiRandomDatum()));
                int id = await MySQL.DB.QueryAsync(cmd);

                foreach (Lek lek in lekoviZaIzdavanje)
                {
                    int kolicina = rnd.Next(1, 10);

                    cmd = new MySqlCommand();
                    cmd.CommandText = "INSERT INTO `log_izdati_lekovi`(`ID`, `ImeLeka`, `SifraLeka`, `Kolicina`, `Cena`) VALUES (@id, @imeLeka, @sifra, @kolicina, @cena)";
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.Parameters.AddWithValue("@imeLeka", lek.Ime);
                    cmd.Parameters.AddWithValue("@sifra", lek.Sifra);
                    cmd.Parameters.AddWithValue("@kolicina", kolicina);
                    cmd.Parameters.AddWithValue("@cena", kolicina * lek.Cena);
                    _ = MySQL.DB.QueryAsync(cmd);
                }
            }
        }
    }
}
