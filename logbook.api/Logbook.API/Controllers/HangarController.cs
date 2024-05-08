using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Logbook.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HangarController : ControllerBase
    {
        private readonly ILogger<AircraftController> _logger;
        private readonly DataContext _context;
        public HangarController(ILogger<AircraftController> logger, DataContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet()]
        public IEnumerable<Hangar> Get()
        {
            return _context.Hangar.Include(h=>h.Aircraft);
        }
    }
}
