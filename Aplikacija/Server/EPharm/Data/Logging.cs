using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.CompilerServices;

namespace EPharm.Data
{

    public class Logging
    {
        public string Reference { get; set; }
        public Logging(string _ref)
        {
            Reference = _ref;
        }
        public enum Type
        {
            Info,
            Warning,
            Error,
            Success
        };

        public void ExceptionTrace(Exception ex, string comment = null, [CallerMemberName] string callerName = "")
        {
            try
            {
                using (StreamWriter exWrite = new StreamWriter("exceptions.txt", true))
                {
                    exWrite.WriteLine($"[{DateTime.Now.ToString("dd/MM/yyyy HH':'mm':'ss.fff")}] | {Reference}.{callerName} {ex.TargetSite.Name}");
                    exWrite.WriteLine(ex.Message);
                    exWrite.WriteLine(ex.StackTrace);
                    exWrite.WriteLine($"Dodatan komentar: {(comment != null ? comment : "NULL")}");
                    exWrite.WriteLine("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
                    exWrite.Close();
                }
            }
            catch (Exception wrEx)
            {
                Debug.WriteLine(wrEx.Message);
                Debug.WriteLine(wrEx.StackTrace);
            }
        }

        public void WriteLine(string text, Type logType = Type.Info)
        {
            try
            {
                using (StreamWriter sw = new StreamWriter("server_log.txt", true))
                {
                    sw.WriteLine($"[{DateTime.Now.ToString("dd/MM/yyyy HH':'mm':'ss.fff")}] | {logType.ToString().ToUpper()} | {text}");
                    sw.Close();
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.StackTrace);
            }
        }
    }
}
