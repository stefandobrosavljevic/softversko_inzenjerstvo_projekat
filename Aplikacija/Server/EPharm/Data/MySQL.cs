using MySqlConnector;
using System;
using System.Data;
using System.Data.Common;
using System.Threading.Tasks;

namespace EPharm.Data
{
    public class MySQL
    {
        private static readonly Logging Log = new Logging("MySQL");

        private readonly string ConnectionString;

        private static MySQL _instance = null;
        public static MySQL DB
        {
            get
            {
                if (_instance == null)
                    _instance = new MySQL();

                return _instance;
            }
        }

        private MySQL()
        {
            ConnectionString = $"Host=127.0.0.1;" +
                                $"User=epharm;" +
                                $"Password=3XLxSRQ5LOigWUl9;" +
                                $"Database=epharm_populated;" +
                                $"SslMode=None;";
        }

        public async Task<int> QueryAsync(MySqlCommand command)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    command.Connection = connection;

                    await command.ExecuteNonQueryAsync();
                    return (int)command.LastInsertedId; // vraca last inserted ID
                }
            }
            catch (Exception ex) { Log.ExceptionTrace(ex, command.CommandText); }
            return -1;
        }

        public async Task<int> QueryAsync(string command)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    using (MySqlCommand cmd = new MySqlCommand())
                    {
                        cmd.Connection = connection;
                        cmd.CommandText = command;

                        await cmd.ExecuteNonQueryAsync();
                        return (int)cmd.LastInsertedId; // vraca last inserted ID
                    }
                }
            }
            catch (Exception ex) { Log.ExceptionTrace(ex, command); }
            return -1;
        }

        public async Task<DataTable> QueryReadAsync(MySqlCommand command)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();

                command.Connection = connection;

                DbDataReader reader = await command.ExecuteReaderAsync();
                DataTable result = new DataTable();
                result.Load(reader);

                return result;
            }
        }

        public async Task<DataTable> QueryReadAsync(string command)
        {
            using (MySqlCommand cmd = new MySqlCommand(command))
            {
                return await QueryReadAsync(cmd);
            }
        }

        public static string ConvertTime(DateTime dateTime)
        {
            return dateTime.ToString("s");
        }
    }
}
