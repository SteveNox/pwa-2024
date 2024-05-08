using Microsoft.EntityFrameworkCore;
using Microsoft.JSInterop.Infrastructure;
using System.Collections.Generic;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Logbook.API
{
    public class DataContext : DbContext
    {
        protected readonly IConfiguration Configuration;

        public DataContext(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            // in memory database used for simplicity, change to a real db for production applications
            //options.UseInMemoryDatabase("Logbook");
            options.UseNpgsql("User id=admin;Password=postgres;Host=localhost;Port=5532;Database=postgres");

            //Migration erstellen:
            //dotnet-ef migrations add <Name>

            //Migration auf DB schreiben:    
            //dotnet-ef database update

            //dotnet ef database update 0
            //dotnet ef migrations remove
        }
        public DbSet<Aircraft> Aircraft { get; set; }
        public DbSet<Hangar> Hangar { get; set; }
    }
}
