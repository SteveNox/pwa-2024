namespace Logbook.API
{
    public class Aircraft
    {
        public int Id { get; set; } = 0;

        public string Callsign { get; set; } = string.Empty;

        public string Manufacturer { get; set; } = string.Empty;

        public string Model { get; set; } = string.Empty;

        public string Remark { get; set; } = string.Empty;
    }
}
