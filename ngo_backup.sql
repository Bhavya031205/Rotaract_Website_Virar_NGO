--
-- PostgreSQL database dump
--

\restrict UlSCavJFeLmZj1gfyuhE5btHD4yEfxWUDz57SVtQcnBsry0hz0Ppp1SDhoNDnsr

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    created_by integer,
    linked_event_id integer,
    linked_project_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category character varying(50) DEFAULT 'General'::character varying
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255)
);


ALTER TABLE public.blog_categories OWNER TO postgres;

--
-- Name: blog_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_categories_id_seq OWNER TO postgres;

--
-- Name: blog_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_categories_id_seq OWNED BY public.blog_categories.id;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    category_id integer,
    title character varying(255) NOT NULL,
    excerpt text,
    content text,
    author_name character varying(100),
    author_role character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_urls text[]
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO postgres;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: donation_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donation_settings (
    id integer NOT NULL,
    bank_name character varying(255),
    account_name character varying(255),
    account_number character varying(255),
    ifsc_code character varying(255),
    branch_name character varying(255),
    upi_id character varying(255),
    preset_amounts integer[],
    contact_email character varying(255)
);


ALTER TABLE public.donation_settings OWNER TO postgres;

--
-- Name: donation_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.donation_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.donation_settings_id_seq OWNER TO postgres;

--
-- Name: donation_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.donation_settings_id_seq OWNED BY public.donation_settings.id;


--
-- Name: donations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donations (
    id integer NOT NULL,
    donor_id integer,
    donation_type character varying(20),
    amount numeric(10,2),
    description text,
    donation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    razorpay_order_id character varying(100),
    razorpay_payment_id character varying(100),
    razorpay_signature character varying(255),
    membership_request_id integer,
    payment_status character varying(50) DEFAULT 'PENDING'::character varying,
    CONSTRAINT donations_donation_type_check CHECK (((donation_type)::text = ANY ((ARRAY['MONEY'::character varying, 'GOODS'::character varying])::text[])))
);


ALTER TABLE public.donations OWNER TO postgres;

--
-- Name: donations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.donations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.donations_id_seq OWNER TO postgres;

--
-- Name: donations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.donations_id_seq OWNED BY public.donations.id;


--
-- Name: donors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donors (
    id integer NOT NULL,
    user_id integer,
    organization_name character varying(200)
);


ALTER TABLE public.donors OWNER TO postgres;

--
-- Name: donors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.donors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.donors_id_seq OWNER TO postgres;

--
-- Name: donors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.donors_id_seq OWNED BY public.donors.id;


--
-- Name: event_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_reports (
    id integer NOT NULL,
    event_id integer,
    submitted_by integer,
    summary text NOT NULL,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.event_reports OWNER TO postgres;

--
-- Name: event_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_reports_id_seq OWNER TO postgres;

--
-- Name: event_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_reports_id_seq OWNED BY public.event_reports.id;


--
-- Name: event_rsvps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_rsvps (
    id integer NOT NULL,
    event_id integer,
    user_id integer,
    response character varying(10),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50),
    CONSTRAINT event_rsvps_response_check CHECK (((response)::text = ANY ((ARRAY['YES'::character varying, 'NO'::character varying, 'MAYBE'::character varying])::text[])))
);


ALTER TABLE public.event_rsvps OWNER TO postgres;

--
-- Name: event_rsvps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.event_rsvps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_rsvps_id_seq OWNER TO postgres;

--
-- Name: event_rsvps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.event_rsvps_id_seq OWNED BY public.event_rsvps.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    event_date date NOT NULL,
    location character varying(200),
    created_by integer,
    status character varying(20) DEFAULT 'UPCOMING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    event_time character varying(50),
    image character varying(255),
    registration_link text,
    gallery text[],
    registration_status character varying(20) DEFAULT 'open'::character varying
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    question text NOT NULL,
    answer text,
    is_published boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faqs_id_seq OWNER TO postgres;

--
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- Name: login_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_history (
    id integer NOT NULL,
    user_id integer,
    login_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address character varying(50),
    device_info text
);


ALTER TABLE public.login_history OWNER TO postgres;

--
-- Name: login_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_history_id_seq OWNER TO postgres;

--
-- Name: login_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_history_id_seq OWNED BY public.login_history.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id integer NOT NULL,
    user_id integer,
    designation character varying(100),
    bio text,
    image text,
    status character varying(50) DEFAULT 'Active'::character varying,
    is_public boolean DEFAULT false,
    join_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.members_id_seq OWNER TO postgres;

--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: membership_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_requests (
    id integer NOT NULL,
    name character varying(100),
    email character varying(150),
    phone character varying(20),
    address text,
    profile_image text,
    work_details text,
    payment_status character varying(20),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.membership_requests OWNER TO postgres;

--
-- Name: membership_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membership_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_requests_id_seq OWNER TO postgres;

--
-- Name: membership_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membership_requests_id_seq OWNED BY public.membership_requests.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255),
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'INR'::character varying,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    purpose character varying(255),
    razorpay_order_id character varying(255),
    razorpay_payment_id character varying(255),
    razorpay_signature character varying(255),
    transaction_id character varying(255),
    donated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: project_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_reports (
    id integer NOT NULL,
    project_id integer,
    submitted_by integer,
    content text NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_reports OWNER TO postgres;

--
-- Name: project_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_reports_id_seq OWNER TO postgres;

--
-- Name: project_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_reports_id_seq OWNED BY public.project_reports.id;


--
-- Name: project_teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_teams (
    id integer NOT NULL,
    project_id integer,
    member_id integer,
    role_in_project character varying(100)
);


ALTER TABLE public.project_teams OWNER TO postgres;

--
-- Name: project_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_teams_id_seq OWNER TO postgres;

--
-- Name: project_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_teams_id_seq OWNED BY public.project_teams.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    start_date date,
    end_date date,
    status character varying(20) DEFAULT 'ONGOING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    location character varying(255),
    beneficiaries character varying(100),
    image text
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: site_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_content (
    page_key character varying(50) NOT NULL,
    content jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_content OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'MEMBER'::character varying,
    needs_password_change boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: blog_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories ALTER COLUMN id SET DEFAULT nextval('public.blog_categories_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: donation_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donation_settings ALTER COLUMN id SET DEFAULT nextval('public.donation_settings_id_seq'::regclass);


--
-- Name: donations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);


--
-- Name: donors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donors ALTER COLUMN id SET DEFAULT nextval('public.donors_id_seq'::regclass);


--
-- Name: event_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_reports ALTER COLUMN id SET DEFAULT nextval('public.event_reports_id_seq'::regclass);


--
-- Name: event_rsvps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_rsvps ALTER COLUMN id SET DEFAULT nextval('public.event_rsvps_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- Name: login_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history ALTER COLUMN id SET DEFAULT nextval('public.login_history_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: membership_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_requests ALTER COLUMN id SET DEFAULT nextval('public.membership_requests_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: project_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_reports ALTER COLUMN id SET DEFAULT nextval('public.project_reports_id_seq'::regclass);


--
-- Name: project_teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_teams ALTER COLUMN id SET DEFAULT nextval('public.project_teams_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, created_by, linked_event_id, linked_project_id, created_at, category) FROM stdin;
3	Welcome to our new website!	We are thrilled to launch our new digital platform to better serve the community.	\N	\N	\N	2025-12-30 22:22:55.340965	News
\.


--
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_categories (id, name, slug) FROM stdin;
1	Testimonials	testimonials
2	Media Coverage	media
3	Collaborations	collaborations
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (id, category_id, title, excerpt, content, author_name, author_role, created_at, image_urls) FROM stdin;
\.


--
-- Data for Name: donation_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donation_settings (id, bank_name, account_name, account_number, ifsc_code, branch_name, upi_id, preset_amounts, contact_email) FROM stdin;
1	HDFC Bank	NGO Foundation Trust	123456789012	HDFC0001234	Mumbai Main Branch	ngo@hdfc	{500,1000,2500,5000}	accounts@ngo.org
\.


--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donations (id, donor_id, donation_type, amount, description, donation_date, razorpay_order_id, razorpay_payment_id, razorpay_signature, membership_request_id, payment_status) FROM stdin;
1	1	MONEY	5000.00	Community support donation	2025-12-25 19:26:12.24364	\N	\N	\N	\N	PENDING
\.


--
-- Data for Name: donors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donors (id, user_id, organization_name) FROM stdin;
1	3	\N
\.


--
-- Data for Name: event_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_reports (id, event_id, submitted_by, summary, submitted_at) FROM stdin;
\.


--
-- Data for Name: event_rsvps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_rsvps (id, event_id, user_id, response, created_at, status) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, description, event_date, location, created_by, status, created_at, event_time, image, registration_link, gallery, registration_status) FROM stdin;
4	dd	dd	2026-01-01	d	1	UPCOMING	2026-01-09 13:20:49.691541	dd	http://localhost:5000/uploads/1767945048033-594334782.png	\N	{}	open
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, question, answer, is_published, created_at) FROM stdin;
2	Is my donation tax-deductible?	Yes, we are a registered NGO. You will receive a receipt for your donation which can be used for tax benefits.	t	2025-12-30 20:19:10.86036
3	Can I volunteer without being a member?	Absolutely! Contact us via email to join our volunteer program.	t	2025-12-30 20:19:10.86036
1	How can I become a member?	You can click on the "Members" link in the menu and select "Become a Member". Fill out the form, and our admin will review your request.	t	2025-12-30 20:19:10.86036
\.


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_history (id, user_id, login_time, ip_address, device_info) FROM stdin;
1	1	2026-01-02 10:39:41.498034	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
2	1	2026-01-02 10:40:11.773681	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
3	1	2026-01-08 12:33:09.824932	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
4	1	2026-01-08 12:55:13.875643	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
5	1	2026-01-08 12:56:10.782802	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
6	1	2026-01-09 11:44:31.426381	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
7	1	2026-01-09 12:18:03.282998	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
8	1	2026-01-09 18:00:59.965404	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
9	1	2026-01-09 18:34:16.921946	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
10	1	2026-01-09 18:38:13.737088	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
11	1	2026-01-09 18:39:45.943776	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
12	1	2026-01-09 18:45:37.381078	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
13	1	2026-01-09 18:47:40.172321	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
14	1	2026-01-09 18:54:28.452883	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
15	1	2026-01-09 19:01:15.324145	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
16	1	2026-01-09 19:18:06.379264	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
17	1	2026-01-09 19:18:17.271336	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
18	1	2026-01-09 19:25:10.860445	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
19	1	2026-01-09 19:40:13.831622	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
20	1	2026-01-09 19:40:50.356173	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
21	1	2026-01-09 19:41:12.265585	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
22	1	2026-01-09 20:11:08.443765	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
23	1	2026-01-09 20:12:08.012375	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
24	1	2026-01-09 20:12:11.660685	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
25	1	2026-01-09 20:13:04.429714	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
26	1	2026-01-09 20:13:49.733357	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
27	1	2026-01-09 20:15:15.148396	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
28	1	2026-01-09 20:15:18.065535	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
29	1	2026-01-09 20:22:32.916536	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
30	1	2026-01-09 20:23:02.902597	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
31	1	2026-01-09 21:47:56.450599	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
32	2	2026-01-09 22:45:03.768466	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
33	2	2026-01-09 22:48:49.485742	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
34	2	2026-01-12 17:42:03.798279	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
35	2	2026-01-12 17:59:21.538005	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
36	2	2026-01-12 17:59:23.078677	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
37	2	2026-01-12 17:59:26.636989	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
38	2	2026-01-15 18:15:49.40159	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
39	2	2026-01-15 18:36:15.598517	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
40	1	2026-01-15 19:12:03.01318	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
41	2	2026-01-15 19:13:39.744747	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
42	2	2026-01-15 20:00:33.687715	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36
43	1	2026-01-19 12:45:31.998921	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
44	2	2026-01-19 12:46:13.38699	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
45	2	2026-01-21 13:50:00.683915	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
46	1	2026-01-21 18:00:04.109358	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
47	2	2026-01-21 18:00:43.750006	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
48	2	2026-01-21 18:07:05.568012	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
49	1	2026-01-21 18:07:26.214211	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, user_id, designation, bio, image, status, is_public, join_date) FROM stdin;
1	1	VP		http://localhost:5000/uploads/1768487443083-201036699.jpeg	\N	t	2026-01-09 21:27:26.763
\.


--
-- Data for Name: membership_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_requests (id, name, email, phone, address, profile_image, work_details, payment_status, status, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, name, email, amount, currency, payment_status, purpose, razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction_id, donated_at) FROM stdin;
\.


--
-- Data for Name: project_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_reports (id, project_id, submitted_by, content, status, submitted_at) FROM stdin;
\.


--
-- Data for Name: project_teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_teams (id, project_id, member_id, role_in_project) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, title, description, start_date, end_date, status, created_at, location, beneficiaries, image) FROM stdin;
1	xyz	111	2026-01-02	2026-02-28	Planned	2026-01-08 13:02:46.716958	xyz	111	http://localhost:5000/uploads/1767941127757-3723398.png
\.


--
-- Data for Name: site_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_content (page_key, content, updated_at) FROM stdin;
about	{"hero": {"title": "About Our Mission", "subtitle": "We are dedicated to sustainable development, healthcare, and empowering communities."}, "team": [], "vision": {"title": "Our Vision", "description": "A world where poverty does not exist and where communities are self-reliant."}, "history": "Founded in 2015, our NGO began as a small group of volunteers...", "mission": {"title": "Our Mission", "description": "To provide accessible healthcare, quality education, and sustainable resources."}}	2025-12-30 18:40:34.574443
home	{"hero": {"image": "http://localhost:5000/uploads/1767971772359-956774403.jpg", "title": "Empowering Communities, Transforming Lives.", "ctaLink": "/donate", "ctaText": "Donate Now", "subtitle": "We are dedicated to sustainable development, education, and healthcare. Join us in building a better future."}, "stats": [{"label": "Projects Completed", "value": "50+"}, {"label": "Lives Impacted", "value": "10k+"}, {"label": "Active Members", "value": "200+"}, {"label": "Transparency", "value": "100%"}], "features": [{"title": "Healthcare", "description": "Providing free medical camps and medicine to rural areas."}, {"title": "Education", "description": "Scholarships and learning centers for underprivileged children."}, {"title": "Sustainability", "description": "Tree plantation drives and water conservation projects."}]}	2026-01-09 20:46:13.475334
contact	{"info": {"email": "contact@ngosystem.org", "phone": "+91 12345 67890", "address": "Mumbai", "workingHours": "Mon - Fri, 9:00 AM - 6:00 PM"}, "socials": {"twitter": "https://twitter.com", "facebook": "https://facebook.com", "linkedin": "https://linkedin.com", "instagram": "https://instagram.com"}}	2025-12-30 21:04:15.63186
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, needs_password_change, created_at) FROM stdin;
1	bhavya damani	bhavya00@gmail.com	$2b$10$IBcTK4KvV6b04vaDUTRqBeimDaHr8ByYa/PZ06EdYHqcWecQViDzW	MEMBER	t	2026-01-09 21:27:26.662062
2	Dheraya k	admin@ngo.org	$2b$10$UIx2fBbS/ULJT6WFvays6uzVMuvaz5H1TOmQ8ObgNof/9J8LIs/RC	ADMIN	f	2026-01-09 22:37:44.649058
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 3, true);


--
-- Name: blog_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_categories_id_seq', 9, true);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 1, false);


--
-- Name: donation_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.donation_settings_id_seq', 1, true);


--
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.donations_id_seq', 1, true);


--
-- Name: donors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.donors_id_seq', 1, true);


--
-- Name: event_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_reports_id_seq', 1, true);


--
-- Name: event_rsvps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_rsvps_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 4, true);


--
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faqs_id_seq', 7, true);


--
-- Name: login_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_history_id_seq', 49, true);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.members_id_seq', 1, true);


--
-- Name: membership_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membership_requests_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: project_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_reports_id_seq', 1, false);


--
-- Name: project_teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_teams_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: donation_settings donation_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donation_settings
    ADD CONSTRAINT donation_settings_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: donations donations_razorpay_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_razorpay_order_id_key UNIQUE (razorpay_order_id);


--
-- Name: donations donations_razorpay_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_razorpay_payment_id_key UNIQUE (razorpay_payment_id);


--
-- Name: donors donors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donors
    ADD CONSTRAINT donors_pkey PRIMARY KEY (id);


--
-- Name: event_reports event_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_reports
    ADD CONSTRAINT event_reports_pkey PRIMARY KEY (id);


--
-- Name: event_rsvps event_rsvps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_rsvps
    ADD CONSTRAINT event_rsvps_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: membership_requests membership_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_requests
    ADD CONSTRAINT membership_requests_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: project_reports project_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_reports
    ADD CONSTRAINT project_reports_pkey PRIMARY KEY (id);


--
-- Name: project_teams project_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_teams
    ADD CONSTRAINT project_teams_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: site_content site_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (page_key);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_linked_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_linked_event_id_fkey FOREIGN KEY (linked_event_id) REFERENCES public.events(id);


--
-- Name: announcements announcements_linked_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_linked_project_id_fkey FOREIGN KEY (linked_project_id) REFERENCES public.projects(id);


--
-- Name: blog_posts blog_posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL;


--
-- Name: donations donations_donor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_donor_id_fkey FOREIGN KEY (donor_id) REFERENCES public.donors(id) ON DELETE CASCADE;


--
-- Name: event_reports event_reports_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_reports
    ADD CONSTRAINT event_reports_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_rsvps event_rsvps_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_rsvps
    ADD CONSTRAINT event_rsvps_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: members members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_reports project_reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_reports
    ADD CONSTRAINT project_reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_teams project_teams_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_teams
    ADD CONSTRAINT project_teams_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict UlSCavJFeLmZj1gfyuhE5btHD4yEfxWUDz57SVtQcnBsry0hz0Ppp1SDhoNDnsr

