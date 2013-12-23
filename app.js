var http = require ("http");
var path = require ("path");
var fs = require ("fs");

var cookie = require ("cookie");
var connect = require ("connect");
var pg = require ("pg");
var session = {
    key:    'BOA',
    cookie: {
        maxAge:     259200000,
        secure:     false
    }
};


var cache = {};
var port = process.env.PORT || 8888;
var pg_connection = process.env.DATABASE_URL || "tcp://postgres:password@127.0.0.1:5432/boa";
var pg_client = new pg.Client (pg_connection);


/// adding a couple more of MIME's on the compression list of connect...
/// @param {Object} request
/// @param {Object} response
function filter (request, response) {
    var type = response.getHeader ('Content-Type') || "";
    return type.match (/plain|image|html|css|javascript|json|ttf/);
}


var app = connect();
app.use (connect.compress ({
	filter:	filter
}));
app.use (connect.favicon (path.join (__dirname, "assets/image/node.png")));
app.use (connect.logger ("dev"));
app.use (connect.limit ('1mb'));
app.use (connect.query ());
app.use (connect.bodyParser ());
app.use (connect.cookieParser ('$^&*GHDW@#D$AP78|=)27tBse!23VFUZ#z!XCE~!$}*FSHI-FBDs36fg6f@{9X$}'));
app.use (connect.session (session));
app.use (connect.csrf ());
app.use (connect.errorHandler ());
app.use ("/static", connect.static (path.join (__dirname, "assets")));
app.use (home);


var server = http.createServer (app).listen (port, function () {
    console.log ("Server listening @ %d", port);

    pg_client.connect (function (error) {
        // if there's an error connecting to the database server we'll be killing the whole thing!
        if (error) {
            console.error ('Dude, i was unable to connect to DB.\n', error);
            process.exit (1);
        }

        else {
            // creating our tables...
            // pg_client.query ("CREATE TABLE IF NOT EXISTS users (id serial NOT NULL, username character varying(256), password character varying(256), following character varying(256)[] DEFAULT '{}'::character varying[], CONSTRAINT \"PK\" PRIMARY KEY (id), CONSTRAINT username UNIQUE (username)); CREATE TABLE IF NOT EXISTS tweet (id serial NOT NULL, by character varying(256), tweet character varying(141), \"timestamp\" timestamp without time zone DEFAULT now(), CONSTRAINT pk PRIMARY KEY (id)); CREATE TABLE IF NOT EXISTS room (id serial NOT NULL, name character varying(64), owner character varying(256), members character varying(256)[] DEFAULT '{}'::character varying[], public boolean DEFAULT true, CONSTRAINT pk_room PRIMARY KEY (id), CONSTRAINT username_fk FOREIGN KEY (owner) REFERENCES users (username) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE, CONSTRAINT name UNIQUE (name)); CREATE TABLE IF NOT EXISTS hash (id serial NOT NULL, hash character varying(140), mentions integer DEFAULT 1, initiator character varying(256), mention_ts timestamp without time zone[] DEFAULT '{}'::timestamp without time zone[], CONSTRAINT pk_hash PRIMARY KEY (id), CONSTRAINT fk_initiator FOREIGN KEY (initiator) REFERENCES users (username) MATCH SIMPLE ON UPDATE CASCADE ON DELETE NO ACTION); CREATE TABLE IF NOT EXISTS messages (id serial NOT NULL, \"to\" character varying(256), \"from\" character varying(256), \"timestamp\" timestamp without time zone DEFAULT now(), seen boolean DEFAULT false, message character varying(2048), CONSTRAINT pk_message PRIMARY KEY (id), CONSTRAINT \"from\" FOREIGN KEY (\"from\") REFERENCES users (username) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE, CONSTRAINT \"to\" FOREIGN KEY (\"to\") REFERENCES users (username) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS request (id serial NOT NULL, \"from\" character varying(256), \"to\" character varying(256), type character varying(64), \"timestamp\" timestamp without time zone DEFAULT now(), CONSTRAINT pk_request PRIMARY KEY (id), CONSTRAINT from_fk FOREIGN KEY (\"from\") REFERENCES users (username) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE, CONSTRAINT to_fk FOREIGN KEY (\"to\") REFERENCES users (username) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE);", function (error, result) {
                // if (error) {
                    // console.log (error);
                // }
            // });
        }
    });
});


function home (request, response) {
    // if we cached it already - there won't be a need to read from DISK - which we all know for being FAST!
    if (cache.body !== undefined) {
        response.setHeader ('Content-Type', 'text/html');
        response.setHeader ('Content-Length', Buffer.byteLength (cache.body + "<input type='hidden' id='csrf' name='_csrf' value='" + request.csrfToken() + "' />"));
        response.end (cache.body + "<input type='hidden' id='csrf' name='_csrf' value='" + request.csrfToken() + "' />");
    }

    else {
        var body = fs.readFileSync (path.join (__dirname, "/template/index.html"), {
            encoding:   "utf-8",
            flag:       "r"
        });

        response.setHeader ('Content-Type', 'text/html');
        response.setHeader ('Content-Length', Buffer.byteLength (body + "<input type='hidden' id='csrf' name='_csrf' value='" + request.csrfToken() + "' />"));
        response.end(body + "<input type='hidden' id='csrf' name='_csrf' value='" + request.csrfToken() + "' />");
        // we'll be caching only the body --- the csrf will be unique for ERY request, well duh it's CSRF!
        cache.body = body;
    }
}
