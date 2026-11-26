const diagramLayouts=[
{kind:'journey',nodes:[['client',120,286,'browser','CLIENT'],['dns',310,144,'cloud','DNS'],['edge',360,286,'cube','EDGE'],['app',590,286,'cube','APPLICATION'],['cache',590,420,'card','CACHE'],['db',840,286,'cylinder','DATABASE'],['jobs',835,420,'queue','JOB QUEUE']],edges:[['client','dns'],['dns','edge'],['client','edge'],['edge','app'],['app','cache'],['app','db'],['db','app'],['app','jobs'],['jobs','app'],['app','client']]},
{kind:'runtime',nodes:[['request',130,266,'browser','REQUEST'],['loop',380,266,'ring','EVENT LOOP'],['worker',640,142,'cube','WORKER'],['io',640,390,'cylinder','I/O'],['memory',830,266,'card','MEMORY']],edges:[['request','loop'],['loop','worker'],['loop','io'],['worker','memory'],['io','loop'],['loop','request']]},
{kind:'api',nodes:[['client',125,265,'browser','CLIENT'],['contract',335,145,'card','CONTRACT'],['edge',350,315,'shield','VALIDATE'],['service',610,265,'cube','SERVICE'],['data',835,265,'cylinder','DATA']],edges:[['client','contract'],['contract','edge'],['client','edge'],['edge','service'],['service','data'],['data','client']]},
{kind:'scaling',nodes:[['users',120,265,'cloud','USERS'],['lb',335,265,'shield','BALANCER'],['app1',600,150,'cube','APP A'],['app2',600,365,'cube','APP B'],['store',840,265,'cylinder','SHARED STATE']],edges:[['users','lb'],['lb','app1'],['lb','app2'],['app1','store'],['app2','store'],['store','users']],fallback:true},
{kind:'data',nodes:[['app',135,265,'cube','APPLICATION'],['index',355,265,'card','INDEX / ROUTER'],['db1',650,120,'cylinder','PARTITION A'],['db2',650,265,'cylinder','PARTITION B'],['db3',650,410,'cylinder','PARTITION C'],['replica',860,265,'cylinder','REPLICA']],edges:[['app','index'],['index','db1'],['index','db2'],['index','db3'],['db2','replica'],['replica','app']],fallback:true},
{kind:'messaging',nodes:[['producer',120,265,'browser','PRODUCER'],['api',315,265,'cube','API'],['queue',525,265,'queue','QUEUE / TOPIC'],['worker1',760,135,'cube','WORKER A'],['worker2',760,265,'cube','WORKER B'],['worker3',760,395,'cube','WORKER C']],edges:[['producer','api'],['api','queue'],['queue','worker1'],['queue','worker2'],['queue','worker3'],['worker2','api']],fallback:true},
{kind:'security',nodes:[['caller',125,265,'browser','CALLER'],['tls',320,265,'shield','TLS'],['identity',515,150,'shield','IDENTITY'],['policy',515,365,'shield','POLICY'],['resource',755,265,'cylinder','RESOURCE'],['audit',875,395,'card','AUDIT']],edges:[['caller','tls'],['tls','identity'],['identity','policy'],['policy','resource'],['resource','audit'],['resource','caller']]},
{kind:'reliability',nodes:[['client',120,265,'browser','CLIENT'],['router',330,265,'shield','ROUTER'],['primary',590,145,'cube','PRIMARY'],['secondary',590,385,'cube','STANDBY'],['store',835,265,'cylinder','DEPENDENCY']],edges:[['client','router'],['router','primary'],['router','secondary'],['primary','store'],['secondary','store'],['store','client']],fallback:true},
{kind:'architecture',nodes:[['client',120,265,'browser','CLIENT'],['gateway',320,265,'shield','GATEWAY'],['svc1',590,120,'cube','SERVICE A'],['svc2',590,265,'cube','SERVICE B'],['svc3',590,410,'cube','SERVICE C'],['state',845,265,'cylinder','DATA']],edges:[['client','gateway'],['gateway','svc1'],['gateway','svc2'],['gateway','svc3'],['svc2','state'],['state','client']]},
{kind:'shipping',nodes:[['code',120,265,'card','SOURCE'],['ci',305,265,'cube','CI'],['image',490,265,'card','ARTIFACT'],['canary',680,145,'cube','CANARY'],['prod',680,385,'cube','PRODUCTION'],['monitor',870,265,'ring','MONITOR']],edges:[['code','ci'],['ci','image'],['image','canary'],['canary','monitor'],['image','prod'],['prod','monitor']],fallback:true},
{kind:'system',nodes:[['users',115,265,'cloud','USERS'],['edge',310,265,'shield','EDGE'],['service',530,265,'cube','SERVICE'],['cache',760,130,'card','CACHE'],['db',760,335,'cylinder','DATABASE'],['worker',920,335,'queue','WORKERS']],edges:[['users','edge'],['edge','service'],['service','cache'],['service','db'],['db','worker'],['service','users']]}
];
const svgEscape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function syncSvgMotion(diagram, paused, reducedMotion) {
  if (paused || reducedMotion) diagram.pauseAnimations?.();
  else diagram.unpauseAnimations?.();
}
const componentDescriptions = {
  'How a Request Travels': {
    client: 'The client creates the HTTP request and receives the response.',
    dns: 'DNS resolves the API hostname to an address the client can connect to.',
    edge: 'The API gateway receives the request and routes it to the application.',
    app: 'The application checks access, applies business rules, and prepares the response.',
    cache: 'The cache can serve a previously stored result; this example continues on a cache miss.',
    db: 'The database finds and returns the requested order.',
    jobs: 'The job queue holds follow-up work for a background worker.'
  }
};
// Explicit lesson-and-component keys keep explanations independent of drawing order.
const componentDetails = {
'DNS, TCP & TLS': {'browser':'Starts the connection to the server.','dns':'Resolves the hostname to an IP address.','connect':'Establishes the transport connection.','tls':'Authenticates the server and encrypts traffic.','server':'Accepts the connection and handles the request.'},
'HTTP Methods, Status Codes & Headers': {'client':'Sends an HTTP request.','method':'Expresses the intended operation, such as GET or POST.','api':'Receives and handles the request.','status':'Communicates the outcome through an HTTP status code.','response':'Returns the result and headers to the client.'},
'Runtime & Event Loop': {'request':'Starts work in the runtime.','event-loop':'Coordinates callbacks and asynchronous work.','i-o':'Represents operations that wait for external resources.','callback':'Continues work when an asynchronous operation completes.','worker':'Runs work outside the event loop when appropriate.'},
'Git & Repository Workflows': {'change':'Represents edits to the project.','commit':'Records a versioned set of changes.','review':'Allows changes to be examined before merging.','merge':'Combines approved changes into a shared branch.','release':'Makes a selected version available for deployment.'},
'Hosting & Infrastructure Basics': {'client':'Requests a hosted service.','dns':'Resolves the service hostname.','edge':'Receives traffic at the network edge.','host':'Runs the application.','database':'Stores application data.'},
'Back-of-the-Envelope Math': {'users':'The example starts with 100,000 daily users.','app':'Application servers handle the estimated request rate.','cache':'A cache can reduce repeated work at the origin.','cdn':'A CDN can serve suitable content closer to users.'},
'API Contracts & OpenAPI': {'client':'Calls the API using its published contract.','contract':'Defines the expected API operations and shapes.','validate':'Checks requests or responses against the contract.','service':'Implements the advertised behavior.','response':'Returns data in the agreed response shape.'},
'REST, RPC & GraphQL': {'client':'Needs a way to access application capabilities.','api':'Exposes an interface between clients and services.','rest':'Models resources with HTTP methods and URLs.','rpc':'Exposes named operations or actions.','graphql':'Lets clients request selected fields through a schema.'},
'Validation & Error Design': {'input':'Contains data submitted by a client.','schema':'Describes the expected input shape.','valid':'Represents input that passes the checks.','invalid':'Represents input that fails validation.','error':'Communicates actionable validation details.'},
'Idempotency & Duplicate Requests': {'client':'Can retry an operation after a missing response.','retry':'Repeats an attempted request.','key':'Identifies the same logical operation across retries.','payment':'Represents an operation that must not be applied twice.','result':'Stores or returns the original operation result.'},
'Vertical vs Horizontal Scaling': {'users':'Generate demand for the service.','router':'Distributes requests across available capacity.','big-server':'Represents scaling up one machine.','pool':'Represents scaling out across multiple machines.','data':'Represents state that instances may need to share.'},
'Load Balancing': {'users':'Send requests to the service.','balancer':'Distributes traffic among healthy targets.','server-a':'One application target in the pool.','server-b':'Another application target in the pool.','server-c':'A third application target in the pool.'},
'Stateless Services': {'client':'Sends requests that may reach different instances.','balancer':'Routes each request to an available instance.','app-a':'One stateless application instance.','app-b':'Another stateless application instance.','session':'Represents session state available independently of one instance.'},
'Caching': {'client':'Requests a resource.','application':'Checks the cache and retrieves missing data.','cache':'Stores reusable results for faster access.','database':'Provides the source data on a cache miss.','response':'Returns the requested result to the client.'},
'Content Delivery Networks': {'users':'Request content from geographically distributed locations.','dns':'Helps direct clients toward a delivery endpoint.','edge-a':'One edge location that can cache content.','edge-b':'Another edge location that can cache content.','origin':'Provides content when it is not available at the edge.'},
'Relational Database Fundamentals': {'app':'Issues queries against relational data.','sql':'Expresses operations on relational data.','table':'Organizes rows into a defined structure.','users':'Represents user records in a table.','orders':'Represents order records that can relate to users.'},
'SQL vs NoSQL': {'query':'Represents an application access pattern.','access':'Highlights how the application reads or writes data.','tables':'Represent relational data with rows and constraints.','documents':'Represent records stored as documents.','decision':'Compares models against the actual access and consistency needs.'},
'Database Indexes': {'query':'Looks for matching records.','database':'Stores the records being searched.','full-scan':'Checks records without using a selective lookup.','index':'Organizes keys to narrow a lookup.','row':'Represents a matching database record.'},
'Transactions & Isolation': {'client-a':'Runs one transaction.','database':'Coordinates the concurrent data operations.','client-b':'Runs another transaction concurrently.','lock':'Controls conflicting access where locking is used.','commit':'Makes a successful transaction durable.'},
'Database Migrations': {'old-app':'Represents application code using the earlier schema.','schema':'Defines the database structure being changed.','add-column':'Adds a schema field as part of a migration.','backfill':'Populates existing rows with the new data.','new-app':'Uses the updated schema after compatibility is established.'},
'Replication': {'app':'Reads or writes data through the replicated system.','leader':'Accepts writes and propagates changes.','follower-a':'Maintains one replica of the leader’s data.','follower-b':'Maintains another replica of the leader’s data.','backup':'Represents a separate recovery copy; replication alone is not a backup.'},
'Sharding': {'client':'Sends a request for a record.','router':'Uses the shard key to choose a destination.','shard-a':'Stores one partition of the dataset.','shard-b':'Stores another partition of the dataset.','shard-c':'Stores a third partition of the dataset.'},
'CAP & Consistency': {'client':'Requests data during normal operation or a partition.','partition':'Represents interrupted communication between nodes.','node-a':'One node that may be isolated by the partition.','node-b':'Another node that may have a different view.','decision':'Represents the choice between response availability and consistency during a partition.'},
'Consensus & Leaders': {'proposal':'Represents a change submitted for agreement.','quorum':'Represents the required majority of participating nodes.','node-a':'One participant in the consensus group.','node-b':'Another participant in the consensus group.','node-c':'A third participant in the consensus group.'},
'Files & Media': {'uploader':'Submits a file for storage.','api':'Controls and validates the upload flow.','object-store':'Stores the file bytes as an object.','worker':'Processes files asynchronously when needed.','cdn':'Can deliver stored media closer to consumers.'},
'Message Queues': {'producer':'Adds work to the queue.','queue':'Holds jobs until a worker can process them.','worker-a':'Processes jobs from the queue.','worker-b':'Provides another worker for queued jobs.','dlq':'Holds messages that cannot be processed after the configured attempts.'},
'Pub/Sub & Events': {'publisher':'Publishes an event.','topic':'Distributes events to interested subscribers.','email':'Represents a subscriber handling email-related work.','analytics':'Represents an independent analytics subscriber.','search':'Represents a subscriber updating search.'},
'Delivery Guarantees & Idempotent Consumers': {'producer':'Publishes an event or job.','broker':'Transports messages to consumers.','worker':'Processes a delivered message.','ack':'Confirms successful processing to the broker.','dedup':'Tracks processed identifiers to avoid duplicate effects.'},
'Backpressure & Dead-Letter Queues': {'producer':'Adds work to the system.','queue':'Buffers work waiting for processing.','workers':'Consume queued work at a limited rate.','retry':'Reattempts processing after a recoverable failure.','dlq':'Retains messages that exceed the retry policy.'},
'Real-time Updates': {'event':'Represents an update to deliver.','gateway':'Manages the connection and routes updates.','socket-a':'One connected client socket.','socket-b':'Another connected client socket.','offline':'Represents a client that is not currently connected.'},
'Authentication': {'login':'Starts an authentication attempt.','identity':'Checks who the caller claims to be.','password':'Represents a credential supplied during login.','session':'Carries authenticated state after successful login.','api':'Receives requests with the authenticated context.'},
'Password Hashing & Credentials': {'password':'The secret submitted by the user.','salt':'Adds a unique value before password hashing.','argon2':'A password-hashing algorithm designed to be costly to guess.','hash':'Stores the derived password hash, not the plaintext password.','login':'Verifies a submitted password against the stored hash.'},
'Sessions, Cookies & OAuth': {'browser':'Makes requests and stores cookies according to browser rules.','cookie':'Carries data such as a session identifier.','session':'Represents server-side or otherwise managed session state.','oauth':'Delegates authorization through an OAuth flow.','api':'Handles requests using the available authentication context.'},
'Authorization': {'caller':'Requests access to an operation.','identity':'Identifies the caller.','policy':'Defines which actions are permitted.','resource':'The data or operation being protected.','audit':'Records relevant access decisions or actions.'},
'Input Safety & Web Threats': {'input':'Contains untrusted data from outside the system.','validate':'Checks input shape and allowed values.','query':'Represents a database operation that must use safe parameterization.','database':'Stores data accessed by the application.','reject':'Represents rejection of unsafe or invalid input.'},
'Encryption & Secrets': {'client':'Connects to a service.','tls':'Protects traffic in transit and authenticates the server.','service':'Uses protected connections and managed credentials.','secret':'Represents sensitive configuration such as a credential.','storage':'Stores data that may require encryption at rest.'},
'Redundancy & Failover': {'users':'Depend on the service remaining available.','router':'Directs traffic to an available target.','primary':'Normally handles the workload.','standby':'Can take over when the primary fails.','store':'Represents a shared or replicated dependency.'},
'Rate Limiting': {'clients':'Generate requests against an API.','limiter':'Enforces a request rate or quota.','tokens':'Represent available capacity in a token-bucket example.','api':'Handles requests admitted by the limiter.','429':'Indicates that a client has exceeded the allowed rate.'},
'Timeouts & Retries': {'client':'Calls a service and waits for a result.','deadline':'Bounds how long the operation may take.','service':'Performs the requested work.','retry':'Reattempts a failed operation under a bounded policy.','fallback':'Provides an alternative response when the primary path fails.'},
'Backups & Disaster Recovery': {'app':'Uses the stored data.','database':'Contains data that needs protection.','snapshot':'Captures a point-in-time representation of data.','backup':'Stores a recovery copy separately from the live system.','restore':'Recovers data from a backup and must be tested.'},
'SLOs & Error Budgets': {'users':'Experience the actual service quality.','sli':'Measures an aspect of service performance.','slo':'Sets a target for the service-level indicator.','budget':'Represents the permitted amount of missed reliability target.','release':'May be paced according to the remaining error budget.'},
'Observability': {'request':'Starts a path through the system.','trace':'Connects related operations across services.','metrics':'Summarize numerical signals over time.','logs':'Record individual events with context.','alert':'Notifies operators when a condition needs attention.'},
'Monolith vs Microservices': {'users':'Use the application.','monolith':'Packages application capabilities into one deployable system.','gateway':'Provides an entry point to services.','service-a':'Represents one independently deployed service.','service-b':'Represents another independently deployed service.'},
'Sagas & Distributed Transactions': {'order':'Starts a multi-step business workflow.','reserve':'Reserves a resource for the order.','charge':'Represents the payment step.','ship':'Represents fulfillment of the order.','compensate':'Runs an appropriate compensating action after a failed step.'},
'Batch & Stream Processing': {'events':'Represent incoming data to process.','ingest':'Accepts and moves incoming data into processing.','batch':'Processes accumulated data in groups.','stream':'Processes data continuously as it arrives.','result':'Represents the output of processing.'},
'Testing': {'change':'Represents a proposed code change.','unit':'Checks a small unit in isolation.','integration':'Checks interactions across components or boundaries.','end-to-end':'Exercises a user-facing flow through the system.','release':'Uses the accumulated test evidence as part of a release decision.'},
'CI/CD & Deployments': {'laptop':'The developer creates a change from a workstation.','ci':'The CI pipeline builds and tests the proposed change.','production':'The production environment runs the released version.','users':'Users receive the deployed application.'},
'Containers & Images': {'source':'Contains the application source used to build an image.','image':'Packages an application and its runtime dependencies.','registry':'Stores versioned container images.','container':'Runs an instance created from an image.','service':'Provides the application capability to consumers.'},
'Orchestration & Autoscaling': {'traffic':'Represents demand arriving at the service.','scheduler':'Places workloads on available infrastructure.','pod-a':'One running workload instance.','pod-b':'Another running workload instance.','database':'Represents a stateful dependency used by the workload.'},
'High-Level & Low-Level Design': {'requirements':'Describe the needs and constraints of the system.','system':'Represents the high-level system boundary.','api':'Defines how clients or components interact.','data':'Represents storage and data-model choices.','failures':'Represent failure cases the design must address.'},
'Design a URL Shortener': {'creator':'Submits a URL to shorten.','api':'Accepts creation and redirect requests.','code':'Identifies the shortened URL.','mapping':'Stores the relationship between a code and its destination.','redirect':'Sends a visitor to the stored destination.'},
'Design a News Feed': {'author':'Creates content for the feed.','post':'Stores a published item.','fan-out':'Distributes or prepares posts for readers.','feed':'Represents the ordered collection shown to a reader.','reader':'Requests and views the feed.'},
'Design a Chat System': {'sender':'Creates and sends a message.','gateway':'Accepts connections and routes messages.','message':'Represents the stored message.','delivery':'Tracks or queues delivery to the recipient.','recipient':'Receives the message.'}
};
function componentDescription(lessonTitle, componentId) {
  const descriptions = Object.hasOwn(componentDescriptions, lessonTitle) ? componentDescriptions[lessonTitle] :
    Object.hasOwn(componentDetails, lessonTitle) ? componentDetails[lessonTitle] : null;
  return descriptions && Object.hasOwn(descriptions, componentId)
    ? descriptions[componentId]
    : 'No component-specific explanation is available for this lesson yet.';
}
function tint(hex,amount){const h=hex.replace('#','');const n=parseInt(h,16);const f=v=>Math.max(0,Math.min(255,Math.round(v+(amount>0?(255-v)*amount:v*amount))));const a=f(n>>16),b=f((n>>8)&255),c=f(n&255);return '#'+[a,b,c].map(x=>x.toString(16).padStart(2,'0')).join('')}
function groundSvg(){return `<ellipse class="iso-ground" cx="0" cy="51" rx="62" ry="15" fill="var(--diagram-ground-shadow)" stroke="none"/>`}
function shapeSvg(shape,color){const light=tint(color,.24),dark=tint(color,-.18),side=tint(color,-.32);switch(shape){
case 'cylinder':return `<path d="M-57 -24 V31 C-57 56 57 56 57 31 V-24" fill="${dark}"/><ellipse cx="0" cy="31" rx="57" ry="22" fill="${side}"/><path d="M-57 -24 V31 C-57 56 57 56 57 31 V-24" fill="${dark}"/><ellipse cx="0" cy="-24" rx="57" ry="22" fill="${light}"/><ellipse cx="0" cy="-24" rx="57" ry="22" fill="none"/><path d="M-57 -24V31 M57 -24V31" fill="none"/>`;
 case 'cube':return `<path d="M-8 -55 Q0 -59 8 -55 L53 -32 Q61 -28 61 -19 V23 Q61 32 53 36 L8 59 Q0 63 -8 59 L-53 36 Q-61 32 -61 23 V-19 Q-61 -28 -53 -32Z" fill="${color}"/><path d="M0 5 L61 -26 V23 Q61 32 53 36 L8 59 Q0 63 0 57Z" fill="${dark}" stroke="none"/><path d="M-53 -32 L-8 -55 Q0 -59 8 -55 L53 -32 Q58 -29 60 -25 L8 2 Q0 6 -8 2 L-60 -25 Q-58 -29 -53 -32Z" fill="${light}" stroke="none"/><path d="M-60 -25 L-8 2 Q0 6 8 2 L60 -25 M0 5V59" fill="none" stroke="#31483a" stroke-opacity=".45"/>`;
 case 'shield':return `<path d="M-8 -57 Q0 -61 8 -57 L50 -38 Q58 -34 58 -25 L56 18 Q54 47 8 64 Q0 67 -8 64 Q-54 47 -56 18 L-58 -25 Q-58 -34 -50 -38Z" fill="${color}"/><path d="M0 -58 L50 -38 Q58 -34 58 -25 L56 18 Q54 47 8 64 Q0 67 0 59Z" fill="${dark}" stroke="none"/><path d="M-50 -38 L-8 -57 Q0 -61 8 -57 L50 -38 Q55 -36 57 -31 L8 1 Q0 6 -8 1 L-57 -31 Q-55 -36 -50 -38Z" fill="${light}" stroke="none"/><path d="M-57 -31 L-8 1 Q0 6 8 1 L57 -31 M0 5V64" fill="none" stroke-opacity=".45"/>`;
 case 'browser': {
  const keys = [0, 5, 10].map(y => [0, 7, 14, 21, 28, 35].map(x =>
    `<rect x="${x}" y="${y}" width="5" height="3.4" rx=".7"/>`
  ).join('')).join('');
  return `
    <path d="M-69 20 L-7 -8 Q0 -11 7 -8 L69 20 Q74 22 74 27 V32 Q74 35 69 38 L7 66 Q0 69 -7 66 L-69 38 Q-74 35 -74 32 V27 Q-74 22 -69 20Z" fill="${side}"/>
    <path d="M-69 20 L-7 -8 Q0 -11 7 -8 L69 20 Q77 24 69 28 L7 56 Q0 59 -7 56 L-69 28 Q-77 24 -69 20Z" fill="${light}"/>
    <g transform="matrix(.91 -.41 .91 .41 -39 25)" stroke="none">
      <rect x="-2" y="-2" width="44" height="17.5" rx="2.6" fill="${dark}"/>
      <g fill="#f9f5ed">${keys}</g>
      <rect x="12" y="20" width="17" height="11" rx="2.4" fill="${color}"/>
    </g>
    <path d="M-58 13 L-64 -41 Q-65 -47 -59 -50 L5 -79 Q11 -82 12 -75 L18 -18 Q19 -12 13 -9 L-50 20 Q-57 23 -58 13Z" fill="${dark}"/>
    <path d="M-53 12 L-59 -40 Q-59 -43 -56 -45 L5 -72 Q7 -73 7 -70 L13 -18 Q14 -15 11 -14 L-50 14 Q-53 16 -53 12Z" fill="#f9f5ed"/>
    <path d="M-49 7 L-54 -40 L3 -66 L8 -18Z" fill="${color}" stroke="none"/>`;
 }
 case 'queue':return `<path d="M-8 -57 Q0 -60 8 -57 L54 -38 Q62 -35 62 -26 V24 Q62 31 54 35 L8 55 Q0 58 -8 55 L-54 35 Q-62 31 -62 24 V-26 Q-62 -35 -54 -38Z" fill="${color}"/><path d="M0 -8 L62 -34 V24 Q62 31 54 35 L8 55 Q0 58 0 52Z" fill="${dark}" stroke="none"/><path d="M-54 -38 L-8 -57 Q0 -60 8 -57 L54 -38 Q59 -36 61 -32 L8 -9 Q0 -5 -8 -9 L-61 -32 Q-59 -36 -54 -38Z" fill="${light}" stroke="none"/><path d="M-61 -32 L-8 -9 Q0 -5 8 -9 L61 -32 M0 -5V55 M-44 -11 L-18 -2 M-44 3 L-18 12 M-44 17 L-18 26" fill="none" stroke-width="2" stroke-linecap="round"/>`;
case 'ring':return `<ellipse cx="0" cy="20" rx="61" ry="31" fill="${dark}"/><ellipse cx="0" cy="-10" rx="61" ry="31" fill="${color}"/><path d="M-61 -10V20 M61 -10V20" fill="none"/><ellipse cx="0" cy="-10" rx="31" ry="16" fill="#fff9"/>`;
case 'people':return `${isoPeople(-30,8,8)}`;
case 'cloud':return `<path d="M-62 8 Q-70 -17 -43 -25 Q-35 -61 -4 -49 Q20 -63 34 -36 Q61 -41 66 -18 Q80 5 60 23 L-37 38 Q-60 34 -62 8Z" fill="${color}"/><path d="M-62 8 L-62 29 Q-57 47 -37 49 L60 34 Q76 26 68 4" fill="${dark}"/><path d="M-62 8 Q-70 -17 -43 -25 Q-35 -61 -4 -49 Q20 -63 34 -36 Q61 -41 66 -18 Q80 5 60 23 L-37 38 Q-60 34 -62 8Z" fill="${light}"/>`;
 default:return `<path d="M-52 -40 H52 Q61 -40 66 -35 L70 -30 Q73 -27 73 -21 V37 Q73 46 64 46 H-45 Q-50 46 -54 42 L-58 38 Q-61 35 -61 28 V-31 Q-61 -40 -52 -40Z" fill="${side}"/><rect x="-61" y="-40" width="122" height="74" rx="10" fill="${color}"/><path d="M-43 -18H42 M-43 -4H20 M-43 10H34" stroke-opacity=".45" fill="none"/>`}}

function nodeIcon(shape){if(shape==='cube')return `<g class="node-glyph" fill="#fffdf7" stroke="#34463c" stroke-width="2"><rect x="-13" y="-29" width="26" height="17" rx="3"/><path d="M-8 -23h10 M-8 -18h10" fill="none"/><circle cx="7" cy="-23" r="1.5" fill="#50a778" stroke="none"/></g>`;if(shape==='cylinder')return `<g class="node-glyph" fill="none" stroke="#34463c" stroke-width="2"><ellipse cx="0" cy="-32" rx="10" ry="4"/><path d="M-10 -32v12q10 8 20 0v-12 M-10 -26q10 8 20 0"/></g>`;if(shape==='shield')return `<g class="node-glyph" fill="none" stroke="#34463c" stroke-width="2.5"><path d="M-9 -22v-5a9 9 0 0 1 18 0v5"/><rect x="-12" y="-22" width="24" height="18" rx="3" fill="#fffaf0"/><path d="M0 -17v7"/></g>`;if(shape==='queue')return `<g class="node-glyph" fill="#fffdf7" stroke="#34463c" stroke-width="1.5"><rect x="-28" y="-20" width="12" height="12" rx="2"/><rect x="-6" y="-20" width="12" height="12" rx="2"/><rect x="16" y="-20" width="12" height="12" rx="2"/></g>`;return ''}

function flowMarkers() {
  return ['muted', 'active', 'failed'].map(state =>
    `<marker id="flow-arrow-${state}" viewBox="0 0 12 10" refX="10" refY="5" markerWidth="12" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path class="arrow-${state}" d="M1 1.5 L10 5 L1 8.5 Z"/></marker>`
  ).join('');
}
function flowLink({ id, from, to, path, state = 'muted', className, load = 0, stroke }) {
  const pathId = 'flow-edge-' + id;
  const line = `<path id="${pathId}" class="${className}" d="${path}" marker-end="url(#flow-arrow-${state})"${stroke ? ' stroke="' + stroke + '"' : ''}/>`;
  const packets = Array.from({ length: Math.min(load, 4) }, (_, index) =>
    `<circle class="flow-packet" r="${index ? 3.5 : 5}" fill="${index ? '#a3db9f' : '#388a5a'}"><animateMotion dur="${Math.max(1.5, 3.6 - load * .35)}s" begin="-${index * .54}s" repeatCount="indefinite"><mpath href="#${pathId}"/></animateMotion></circle>`
  ).join('');
  return `<g class="flow-link" data-edge-from="${from}" data-edge-to="${to}">${line}${packets}</g>`;
}
function diagramViewBox(result,step,scenario){
  if(scenario||step>=2||!result.nodes.length)return '0 0 1000 500';
  const xs=result.nodes.map(node=>node[1]),ys=result.nodes.map(node=>node[2]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const width=Math.min(1000,Math.max(450,maxX-minX+300,(maxY-minY+220)*2));
  const height=width/2;
  return `${(minX+maxX-width)/2} ${(minY+maxY-height)/2} ${width} ${height}`;
}
function diagramMarkup(lesson,step,scenario,load){
document.getElementById('diagram').setAttribute('viewBox','0 0 1000 500');
if(lesson.title==='Back-of-the-Envelope Math')return mathScene(lesson,step,scenario,load);
if(lesson.title==='CI/CD & Deployments')return deployScene(lesson,step,scenario,load);
const layout=sceneProfileLayout(lesson)||diagramLayouts[lesson.categoryIndex],palette=['#dcefe2','#d9e7fa','#f8d9ed','#d7efd9','#e6dcf8','#ffe2bf','#f5d6de','#dce9f7','#d3eee8','#f3e8ba','#dce5f4'];
const nodes=layout.nodes,edges=layout.edges,progress=step/Math.max(1,lesson.steps.length-1);
const visibleCount=Math.min(nodes.length,step+1);
const journeyReveal=[['client'],['client','dns','edge'],['client','dns','edge','app'],['client','dns','edge','app','cache'],['client','dns','edge','app','cache','db'],['client','dns','edge','app','cache','db'],['client','dns','edge','app','cache','db','jobs'],['client','dns','edge','app','cache','db','jobs']];
const visibleIds=new Set(layout.kind==='journey'&&lesson.title==='How a Request Travels'?journeyReveal[Math.min(step,7)]:nodes.slice(0,visibleCount).map(n=>n[0]));
const visibleNodes=nodes.filter(n=>visibleIds.has(n[0]));
const availableEdges=edges.map((edge,i)=>({edge,i})).filter(({edge})=>visibleIds.has(edge[0])&&visibleIds.has(edge[1]));
const journeyActive=[-1,1,3,4,5,6,7,9];
let activeIndex=layout.kind==='journey'&&lesson.title==='How a Request Travels'?journeyActive[Math.min(step,7)]:(availableEdges.length?availableEdges[Math.min(availableEdges.length-1,Math.max(0,step-1))].i:-1);
const failureActive=scenario||(step===5&&layout.kind!=='journey');
const failedNode=failureActive?(nodes[sceneFailureTargets[lesson.title]??Math.max(0,nodes.length-1)]?.[0]||null):null;
if(failureActive&&failedNode){const target=availableEdges.find(({edge})=>edge[1]===failedNode);if(target)activeIndex=target.i}
const activeEdge=activeIndex>=0?edges[activeIndex]:null;
const alternate=failureActive&&layout.fallback&&activeEdge?availableEdges.find(({edge,i})=>i!==activeIndex&&edge[0]===activeEdge[0]&&edge[1]!==failedNode)?.i:-1;
const effectiveEdge=alternate>=0?alternate:activeIndex;
let out=`<defs><filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="6" dy="9" stdDeviation="5" flood-color="#20392b" flood-opacity=".18"/></filter>${flowMarkers()}</defs>`;
const nodeMap=new Map(nodes.map(n=>[n[0],n]));
availableEdges.forEach(({edge, i}) => {
  const [from, to] = edge;
  const a = nodeMap.get(from), b = nodeMap.get(to);
  const active = i === effectiveEdge && (!failureActive || alternate >= 0);
  const failed = failureActive && edge.includes(failedNode);
  out += flowLink({
    id: i, from, to, path: `M${a[1]} ${a[2]} L${b[1]} ${b[2]}`,
    className: `diagram-edge scene-reveal ${active ? 'edge-active' : ''} ${failed ? 'edge-failed' : ''}`,
    state: failed ? 'failed' : active ? 'active' : 'muted',
    load: active ? load : 0
  });
});
 visibleNodes.forEach((n,i)=>{const [id,x,y,shape,label]=n,active=failureActive?id===failedNode:i===visibleNodes.length-1,failed=id===failedNode,color=failed?'#ffd4d0':tint(lesson.category.color,.72),caption=svgEscape(label),labelY=shape==='browser'||shape==='people'?86:shape==='cylinder'?10:24,labelWidth=Math.max(54,label.length*7+20);out+=`<g class="diagram-node ${active&&step<=4?'scene-enter':''} ${active?'node-hot':''} ${failed?'node-failed':''}" data-inspect="${id}" data-layout-node="${id}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="Inspect ${caption}">${groundSvg()}<g class="shape" filter="url(#nodeShadow)" stroke="#31453a" stroke-width="2.5" stroke-linejoin="round">${shapeSvg(shape,color)}</g>${nodeIcon(shape)}<g class="node-badge"><rect x="${-labelWidth/2}" y="${labelY-14}" width="${labelWidth}" height="20" rx="10"/><text class="node-label" x="0" y="${labelY}" text-anchor="middle">${caption}</text></g>${failed?'<text class="fail-mark" x="49" y="-45">×</text>':''}</g>`});
if(step>=2)out+=diagramDecor(layout.kind,step,load,failureActive);
if(failureActive)out+=`<g class="failure-banner"><rect x="328" y="18" width="344" height="34" rx="17"/><text x="500" y="40" text-anchor="middle">FAILURE MODE · ${alternate>=0?'HEALTHY PATH ACTIVE':'INSPECT THE FAILED COMPONENT'}</text></g>`;
 const result={html:out,nodes:visibleNodes,layout,failedNode};
 document.getElementById('diagram').setAttribute('viewBox',diagramViewBox(result,step,failureActive));
 return result}

function diagramDecor(kind,step,load,scenario){let s='';if(kind==='data'){s+=`<g class="diagram-chip" transform="translate(274 70)"><rect width="210" height="33" rx="16"/><text x="105" y="21" text-anchor="middle">hash(key) → ${scenario?'rebalance':'partition B'}</text></g>`;for(const [x,y,p] of [[650,190,30],[650,335,scenario?95:55],[650,480,20]])s+=`<g class="load-bar" transform="translate(${x-38} ${y})"><rect width="76" height="6" rx="3"/><rect width="${p*.76}" height="6" rx="3" class="fill ${p>90?'hot':''}"/></g>`}if(kind==='messaging'){for(let i=0;i<Math.min(7,load+3);i++)s+=`<rect class="queue-job" x="${480+i*13}" y="${325+(i%2)*6}" width="9" height="9" rx="2" style="animation-delay:-${i*.3}s"/>`}if(kind==='runtime')s+=`<circle class="orbit-dot" cx="380" cy="205" r="7"><animateTransform attributeName="transform" type="rotate" from="0 380 266" to="360 380 266" dur="3s" repeatCount="indefinite"/></circle>`;if(kind==='scaling'||kind==='reliability'){s+=`<g class="diagram-chip" transform="translate(485 55)"><rect width="175" height="33" rx="16"/><text x="87" y="21" text-anchor="middle">${scenario?'failover active':load*80+' requests / sec'}</text></g>`}if(kind==='security')s+=`<g class="diagram-chip" transform="translate(370 55)"><rect width="220" height="33" rx="16"/><text x="110" y="21" text-anchor="middle">${scenario?'access denied':'identity ✓  policy ✓'}</text></g>`;if(kind==='shipping')s+=`<g class="diagram-chip" transform="translate(375 55)"><rect width="210" height="33" rx="16"/><text x="105" y="21" text-anchor="middle">${scenario?'rollback ready':'build ✓ test ✓ deploy'}</text></g>`;if(kind==='system')s+=`<g class="diagram-chip" transform="translate(395 60)"><rect width="200" height="33" rx="16"/><text x="100" y="21" text-anchor="middle">${scenario?'degraded path':'end-to-end trace'}</text></g>`;return s}
