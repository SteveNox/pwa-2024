using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Logbook.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AircraftController : ControllerBase
    {
        private readonly ILogger<AircraftController> _logger;
        private readonly DataContext _context;
        public AircraftController(ILogger<AircraftController> logger, DataContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet()]
        public IEnumerable<Aircraft> Get()
        {
            //return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            //{
            //    Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            //    TemperatureC = Random.Shared.Next(-20, 55),
            //    Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            //})
            //.ToArray();
            //return new List<Aircraft>
            //{
            //    new Aircraft
            //    {
            //        Callsign = "G-ABCD", Manufacturer = "Boeing", Model = "747"
            //    }
            //};
            return _context.Aircraft;
        }

        [HttpGet("Callsign/{callsign}")]
        public IEnumerable<Aircraft> Get(string callsign)
        {
            //return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            //{
            //    Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            //    TemperatureC = Random.Shared.Next(-20, 55),
            //    Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            //})
            //.ToArray();
            //return new List<Aircraft>
            //{
            //    new Aircraft
            //    {
            //        Callsign = "G-ABCD", Manufacturer = "Boeing", Model = "747"
            //    }
            //};
            return _context.Aircraft.Where(a=>a.Callsign == callsign);
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            //return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            //{
            //    Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            //    TemperatureC = Random.Shared.Next(-20, 55),
            //    Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            //})
            //.ToArray();
            //return new List<Aircraft>
            //{
            //    new Aircraft
            //    {
            //        Callsign = "G-ABCD", Manufacturer = "Boeing", Model = "747"
            //    }
            //};
            var aircraft = _context.Aircraft.Find(id);
            if (aircraft == null)
            {
                return NotFound(aircraft);
            }
            return Ok(aircraft);
        }

        [HttpPost]
        public IActionResult Post([FromBody] Aircraft aircraft)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            if (aircraft.Id == 0)
            {
                _context.Add(aircraft);
            } else
            {
                _context.Update(aircraft);
            }
            _context.SaveChanges();
            return Ok(aircraft);
        }

        [HttpDelete("delete/{id}")]
        public IActionResult Delete(int id)
        {
            var aircraft = _context.Aircraft.Find(id);
            if (aircraft == null)
            {
                return NotFound();
            }

            var result = _context.Entry(aircraft).State = EntityState.Deleted;
            _context.SaveChanges();
            
            return Ok(aircraft);
        }
    }
}
