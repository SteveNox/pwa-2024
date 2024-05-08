using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Logbook.API.Migrations
{
    /// <inheritdoc />
    public partial class addedHangar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HangarId",
                table: "Aircraft",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Hangar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hangar", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Aircraft_HangarId",
                table: "Aircraft",
                column: "HangarId");

            migrationBuilder.AddForeignKey(
                name: "FK_Aircraft_Hangar_HangarId",
                table: "Aircraft",
                column: "HangarId",
                principalTable: "Hangar",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Aircraft_Hangar_HangarId",
                table: "Aircraft");

            migrationBuilder.DropTable(
                name: "Hangar");

            migrationBuilder.DropIndex(
                name: "IX_Aircraft_HangarId",
                table: "Aircraft");

            migrationBuilder.DropColumn(
                name: "HangarId",
                table: "Aircraft");
        }
    }
}
