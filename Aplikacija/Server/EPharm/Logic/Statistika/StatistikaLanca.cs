using EPharm.Data;
using EPharm.Logic.Apoteke;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace EPharm.Logic.Statistika
{
    public class StatistikaLanca
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("StatistikaLanca");

        public static async Task<Dictionary<string, double>> VratiPrihodePoApotekama(short brMeseci)
        {
            Dictionary<string, double> prihodi = new();
            try
            {
                DateTime danasjiDatum = DateTime.Now;
                if (brMeseci < 1) brMeseci = 1;
                DateTime pocetniDatum = danasjiDatum.AddMonths(-brMeseci);

                string danasnjiDatumString = danasjiDatum.ToString("s");
                string pocetniDatumString = $"{pocetniDatum.Year}-{pocetniDatum.Month}-01 00:00:00";


                foreach (var kvp in LanacApoteka.Apoteke)
                {
                    Apoteka ap = kvp.Value;
                    int idApoteke = ap.ID;
                    string queryUslovi =
                        $"Apoteka = {idApoteke} AND (Datum BETWEEN '{pocetniDatumString}' AND '{danasnjiDatumString}')";

                    DataTable dt = await MySQL.DB.QueryReadAsync($"SELECT SUM(Cena) AS Prihod FROM `log_izdati_lekovi` WHERE ID IN (SELECT ID FROM `log_izdavanje_lekova` WHERE {queryUslovi})");

                    if (dt != null && dt.Rows.Count > 0 && !dt.Rows[0].IsNull("Prihod"))
                        prihodi.Add($"{ap.Adresa}, {ap.Grad}", Convert.ToDouble(dt.Rows[0]["Prihod"]));
                    else
                        prihodi.Add($"{ap.Adresa}, {ap.Grad}", 0);
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }

            return prihodi;
        }

        public static async Task<Dictionary<string, double>> VratiNajprodavanijeLekove(short brLekova)
        {
            Dictionary<string, double> data = new();
            try
            {
                DataTable dt = await MySQL.DB.QueryReadAsync(
                    $"SELECT SUM(Kolicina) AS UkupnaKolicina, ImeLeka, SifraLeka " +
                    $"FROM `log_izdati_lekovi` " +
                    $"GROUP BY ImeLeka, SifraLeka " +
                    $"ORDER BY `UkupnaKolicina` DESC");

                if (dt != null && dt.Rows.Count > 0)
                {
                    if (brLekova < 1) brLekova = 1;
                    int brojLekova = 0;
                    foreach (DataRow row in dt.Rows)
                    {
                        if (brojLekova == brLekova) break;

                        double kolicina = Convert.ToDouble(row["UkupnaKolicina"]);
                        int sifra = Convert.ToInt32(row["SifraLeka"]);
                        string imeLeka = Convert.ToString(row["ImeLeka"]);

                        data.Add($"{imeLeka}({sifra})", kolicina);
                        brojLekova++;
                        //Log.WriteLine($"[DEBUG] {imeLeka}({sifra}) = {kolicina}");
                    }
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }

            return data;
        }

        public static async Task<Dictionary<string, long>> VratiBrojProdajaPoMesecima(short brMeseci)
        {
            Dictionary<string, long> data = new();
            try
            {
                DateTime danasjiDatum = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                if (brMeseci < 1) brMeseci = 1;

                for (int i = 0; i < brMeseci; i++)
                {
                    DateTime datum = danasjiDatum.AddMonths(-i);
                    string datumString = $"{datum.Year}-{datum.Month}";
                    int brojDanaUMesecu = DateTime.DaysInMonth(datum.Year, datum.Month);
                    //Log.WriteLine($"[DEBUG] Sledi provera za datum: {datum} ({datumString})", Logging.Type.Info);

                    string queryUslovi =
                        $"(Datum BETWEEN '{datumString}-01 00:00:00' AND '{datumString}-{brojDanaUMesecu} 23:59:59')";

                    DataTable dt = await MySQL.DB.QueryReadAsync($"SELECT COUNT(*) AS UkupanBrojProdaja FROM `log_izdavanje_lekova` WHERE {queryUslovi}");

                    if (dt != null && dt.Rows.Count > 0 && !dt.Rows[0].IsNull("UkupanBrojProdaja"))
                    {
                        data.Add(datumString, Convert.ToInt64(dt.Rows[0]["UkupanBrojProdaja"]));
                        //Log.WriteLine($"[DEBUG] Postoje podaci za datum {datumString}", Logging.Type.Info);
                    }
                    else
                        data.Add(datumString, 0);
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }

            return data;
        }
    }
}
