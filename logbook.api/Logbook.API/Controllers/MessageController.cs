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
            // {"endpoint":"https://wns2-par02p.notify.windows.com/w/?token=BQYAAACORVzI9LgvqSkbqXRYfthDg3kwBu3ebRAalxbxZ3aWuvAGbVGtPT1RNkoKcsmW13rAvpC4pV%2bJR0GzX5O21MOysab6dMrf0Ew7nays%2fsApjvsA9mpLz5cYKTtXQ8rAJJPZAiFIacQ2HbKaTPiBXy%2fl4Y5P8DxlEwfPGVMz%2b2b1W5GUmCVxi5BP%2bmFEZafQgLSPZFB%2f5a%2bkiQxFz66ZxA7hEUbFCSwcs53%2b6iGet9qBUR7RbtABYrbEzeK1WDM9A70DJBsBe3n0RD3qUa%2biuFIQ5S6imboYxWkS6Gjdad%2bF4c2k6AmiUMunbWDdUYYFwDE%3d","expirationTime":null,"keys":{"p256dh":"BIELlCvOoC-LGcgOJNjkL9-1IDAQAkkAWhsfRFV9KLsWmWXQinNgHBy8ZQlQLxH7aG54djlM9SqRsNr-Bp_zZgE","auth":"80W0R_ZcZxh6NOazuOvr5g"}}


            var pushEndpoint = @"https://wns2-par02p.notify.windows.com/w/?token=BQYAAACORVzI9LgvqSkbqXRYfthDg3kwBu3ebRAalxbxZ3aWuvAGbVGtPT1RNkoKcsmW13rAvpC4pV%2bJR0GzX5O21MOysab6dMrf0Ew7nays%2fsApjvsA9mpLz5cYKTtXQ8rAJJPZAiFIacQ2HbKaTPiBXy%2fl4Y5P8DxlEwfPGVMz%2b2b1W5GUmCVxi5BP%2bmFEZafQgLSPZFB%2f5a%2bkiQxFz66ZxA7hEUbFCSwcs53%2b6iGet9qBUR7RbtABYrbEzeK1WDM9A70DJBsBe3n0RD3qUa%2biuFIQ5S6imboYxWkS6Gjdad%2bF4c2k6AmiUMunbWDdUYYFwDE%3d";
            var p256dh = @"BIELlCvOoC-LGcgOJNjkL9-1IDAQAkkAWhsfRFV9KLsWmWXQinNgHBy8ZQlQLxH7aG54djlM9SqRsNr-Bp_zZgE";
            var auth = @"80W0R_ZcZxh6NOazuOvr5g";

            //from web-push generate-vapid-keys --json in client app
            //{
            //    "publicKey":"BLQ2M8Zcrr3T0HvQc1Y5i0MD-bZclVJnmr0aR04zEpBEfQaK9WOQvVISThPwD3YoTcGlcOGXH-a1TWU9YPj-zh4","privateKey":"CNFqf7btf6T_4BAUiy4ZUBZW-ImTyel777Azg7CZQoQ"}

            var subject = @"mailto:example@example.com";
            var publicKey = @"BLQ2M8Zcrr3T0HvQc1Y5i0MD-bZclVJnmr0aR04zEpBEfQaK9WOQvVISThPwD3YoTcGlcOGXH-a1TWU9YPj-zh4";
            var privateKey = @"CNFqf7btf6T_4BAUiy4ZUBZW-ImTyel777Azg7CZQoQ";

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
