using EPharm.Data;
using EPharm.Logic.Apoteke;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EPharm.Logic.Statistika
{
    public class StatistikaApoteke
    {
        [JsonIgnore] private static readonly Logging Log = new Logging("StatistikaApoteka");

        public static async Task<Dictionary<string, double>> VratiPrihodePoMesecima(Apoteka ap, short brMeseci)
        {
            Dictionary<string, double> prihodi = new();
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

                    string queryApotekaUslov = ap != null ? $"Apoteka = {ap.ID} AND " : "";
                    string queryUslovi =
                        $"{queryApotekaUslov}(Datum BETWEEN '{datumString}-01 00:00:00' AND '{datumString}-{brojDanaUMesecu} 23:59:59')";

                    DataTable izdatiLekovi = await MySQL.DB.QueryReadAsync($"SELECT SUM(Cena) AS Prihod FROM `log_izdati_lekovi` WHERE ID IN (SELECT ID FROM `log_izdavanje_lekova` WHERE {queryUslovi})");

                    if (izdatiLekovi != null && izdatiLekovi.Rows.Count > 0 && !izdatiLekovi.Rows[0].IsNull("Prihod"))
                    {
                        prihodi.Add(datumString, Convert.ToDouble(izdatiLekovi.Rows[0]["Prihod"]));
                        //Log.WriteLine($"[DEBUG] Postoje podaci za datum {datumString}", Logging.Type.Info);
                    }
                    else
                        prihodi.Add(datumString, 0);

                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }

            return prihodi;
        }

        public static async Task<Dictionary<string, long>> VratiBrojProdatihLekovaPoMesecima(Apoteka ap, short brMeseci)
        {
            Dictionary<string, long> prihodi = new();
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

                    string queryApotekaUslov = ap != null ? $"Apoteka = {ap.ID} AND " : "";
                    string queryUslovi =
                        $"{queryApotekaUslov}(Datum BETWEEN '{datumString}-01 00:00:00' AND '{datumString}-{brojDanaUMesecu} 23:59:59')";

                    DataTable izdatiLekovi = await MySQL.DB.QueryReadAsync($"SELECT COUNT(*) AS UkupanBrojProdatih FROM `log_izdati_lekovi` WHERE ID IN (SELECT ID FROM `log_izdavanje_lekova` WHERE {queryUslovi})");

                    if (izdatiLekovi != null && izdatiLekovi.Rows.Count > 0 && !izdatiLekovi.Rows[0].IsNull("UkupanBrojProdatih"))
                    {
                        prihodi.Add(datumString, Convert.ToInt64(izdatiLekovi.Rows[0]["UkupanBrojProdatih"]));
                        //Log.WriteLine($"[DEBUG] Postoje podaci za datum {datumString}", Logging.Type.Info);
                    }
                    else
                        prihodi.Add(datumString, 0);
                }
            }
            catch (Exception ex)
            {
                Log.ExceptionTrace(ex);
            }

            return prihodi;
        }
    }
}
