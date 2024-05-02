using Org.BouncyCastle.Bcpg;

namespace Logbook.API
{
    public class Message
    {
        public string title {get; set; } = string.Empty;

        public string content { get; set; } = string.Empty;
    }
}
