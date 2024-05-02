using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using WebPush;

namespace Logbook.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly ILogger<AircraftController> _logger;
        public MessageController(ILogger<AircraftController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Message message)
        {
            //from subscription of client app:
            //{
            //    "endpoint":"https://wns2-par02p.notify.windows.com/w/?token=BQYAAAATiFLRq4mZqu7JY1mSlAwzqWPxYZapXkuxOr34ITOC2eg8xF9hBxufDYvXE%2foz5x6DBObIIjw7YA2ZuSoQLeQiAVaZOjLIwah6XFwHwaG1%2bVpaMA02nI8h8DRHLfY7knFcxodJ7OYLQH1V%2b1kzjtakipSGFEeTmhMpsyn3kzASe%2fiLggarCFqjfA4tMiPZ2N1T5zH%2fxUPr7BAkxto3Dhy7NOGW%2b%2fW%2bADHlQ6R%2fhGahXTK7dpiul%2booJRqeVweoFFbn5MkORPdW9brTzrTneQZAbssPDS1IU3mHFxaPsR3CvoG%2fK9DsA41biQgK7avQL2g%3d","expirationTime":null,"keys":{
            //        "p256dh":"BOPwPbJFjgSmGRFn-goaP8MXJLBzT8WHLQnqEp1JjVKy0IrstCqGQiu3aqerXP-yNFBqqRsE8OQAJKnxKh6sXts","auth":"Z_j-CDtwVqlwR86HEITOYw"}
            //}

            var pushEndpoint = @"https://wns2-par02p.notify.windows.com/w/?token=BQYAAAATiFLRq4mZqu7JY1mSlAwzqWPxYZapXkuxOr34ITOC2eg8xF9hBxufDYvXE%2foz5x6DBObIIjw7YA2ZuSoQLeQiAVaZOjLIwah6XFwHwaG1%2bVpaMA02nI8h8DRHLfY7knFcxodJ7OYLQH1V%2b1kzjtakipSGFEeTmhMpsyn3kzASe%2fiLggarCFqjfA4tMiPZ2N1T5zH%2fxUPr7BAkxto3Dhy7NOGW%2b%2fW%2bADHlQ6R%2fhGahXTK7dpiul%2booJRqeVweoFFbn5MkORPdW9brTzrTneQZAbssPDS1IU3mHFxaPsR3CvoG%2fK9DsA41biQgK7avQL2g%3d";
            var p256dh = @"BOPwPbJFjgSmGRFn-goaP8MXJLBzT8WHLQnqEp1JjVKy0IrstCqGQiu3aqerXP-yNFBqqRsE8OQAJKnxKh6sXts";
            var auth = @"Z_j-CDtwVqlwR86HEITOYw";

            //from web-push generate-vapid-keys --json
            //{
            //    "publicKey":"BFOTzhZHGeTcfb1RHWbHsJ6QArYb6TVFplPDoa-0oMoejmHe317rxngcSLFq7Fsfd3Nm3qWl2mcIS8053cPo62E","privateKey":"UsMheRVlStav_3SsY5qaX--Zyx1IaF8ulev3c2czZWs"}

            var subject = @"mailto:example@example.com";
            var publicKey = @"BFOTzhZHGeTcfb1RHWbHsJ6QArYb6TVFplPDoa-0oMoejmHe317rxngcSLFq7Fsfd3Nm3qWl2mcIS8053cPo62E";
            var privateKey = @"UsMheRVlStav_3SsY5qaX--Zyx1IaF8ulev3c2czZWs";

            var subscription = new PushSubscription(pushEndpoint, p256dh, auth);
            var vapidDetails = new VapidDetails(subject, publicKey, privateKey);
            //var gcmAPIKey = @"[your key here]";

            var payload = JsonSerializer.Serialize(message);

            var webPushClient = new WebPushClient();
            try
            {
                await webPushClient.SendNotificationAsync(subscription, payload, vapidDetails);
                //await webPushClient.SendNotificationAsync(subscription, "payload", gcmAPIKey);
                return Ok();
            }
            catch (WebPushException exception)
            {
                Console.WriteLine("Http STATUS code" + exception.StatusCode);
                return BadRequest(exception.StatusCode);
            }
        }
    }
}
