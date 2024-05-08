namespace Logbook.API
{
    public class Hangar
    {
        public int Id { get; set; } = 0;

        public string Name { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;
        
        public List<Aircraft> Aircraft { get; set; } = new List<Aircraft>();
    }
}
