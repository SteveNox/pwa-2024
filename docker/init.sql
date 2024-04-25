
create schema lager;

CREATE TABLE IF NOT EXISTS lager.bestellung
(
    bestellung_id numeric(10,0) NOT NULL,
    besteller character varying(100) COLLATE pg_catalog."default",
    lieferant character varying(100) COLLATE pg_catalog."default",
    liefer_adresse character varying(150) COLLATE pg_catalog."default",
    bestellungsinhalt character varying(150) COLLATE pg_catalog."default",
    CONSTRAINT bestellung_pkey PRIMARY KEY (bestellung_id)
);

delete from lager.bestellung;
insert into lager.bestellung (bestellung_id, besteller, lieferant, liefer_adresse, bestellungsinhalt)
values 
	(1, 'Donald Duck', 'Pizza Entenhausen', 'Entenhausenerstraße 27', '1 Pizza Marghrerita'),
	(2, 'Daisy Duck', 'Chateau Entenhausen', 'Entenhausenerstraße 29', '1 Beauf Stroganoff'),
	(3, 'Dagobert Duck', 'Pizza Entenhausen', 'Entenhausenerstraße 27', '1 Pizza Marghrerita'),
	(4, 'Micky Maus', 'Pizza Entenhausen', 'Entenhausenerstraße 27', '1 Pizza Marghrerita'),
	(5, 'Gustav Gans', 'Pizza Entenhausen', 'Entenhausenerstraße 27', '1 Pizza Marghrerita')
	;
	
create sequence lager.bestellung_seq start with 1 increment by 1;

select * from lager.bestellung;