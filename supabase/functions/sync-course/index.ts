// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VERIFIED_MAP = [
  { category: "General / Intro", title: "Resume Course", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474", video_url: "https://embed-ssl.wistia.com/deliveries/9p9s8iiisa.mp4" },
  { category: "Course Introduction & Foundational Knowledge", title: "Learning Materials", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167681807", video_url: null },
  { category: "Course Introduction & Foundational Knowledge", title: "About Your Instructor", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655462", video_url: "https://embed-ssl.wistia.com/deliveries/ynribqn4x1.mp4" },
  { category: "Course Introduction & Foundational Knowledge", title: "Overview of the Approach", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655465", video_url: "https://embed-ssl.wistia.com/deliveries/lfxk9uzojg.mp4" },
  { category: "Course Introduction & Foundational Knowledge", title: "Performance Iceberg", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167257485", video_url: "https://embed-ssl.wistia.com/deliveries/3tocvvu9v1.mp4" },
  { category: "Course Introduction & Foundational Knowledge", title: "Neurophysiology 101", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655463", video_url: "https://embed-ssl.wistia.com/deliveries/2ikwbq0n13.mp4" },
  { category: "Course Introduction & Foundational Knowledge", title: "3 Stages of Stress", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622397", video_url: "https://embed-ssl.wistia.com/deliveries/b4wa740tje.mp4" },
  { category: "Course Introduction & Foundational Knowledge", title: "Threat Neurophysiology", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622399", video_url: "https://embed-ssl.wistia.com/deliveries/silwnqovd7.mp4" },
  { category: "Course Introduction & Foundational Knowledge", title: "Autonomic Nervous System Overview", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167679824", video_url: null },
  { category: "Clinical Assessments", title: "BOLT Test", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167251417", video_url: "https://embed-ssl.wistia.com/deliveries/ehor53pa9p.mp4" },
  { category: "Clinical Assessments", title: "Breathing Assessment Quiz", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167619695", video_url: null },
  { category: "Clinical Assessments", title: "Lecture: Muscle Testing Fundamentals", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164865269", video_url: "https://embed-ssl.wistia.com/deliveries/rkfyj7cmd6.mp4" },
  { category: "Clinical Assessments", title: "Muscle Testing Quiz", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2173091485", video_url: null },
  { category: "Clinical Assessments", title: "Demo: Indicator Muscle Fundamentals", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167415588", video_url: "https://embed-ssl.wistia.com/deliveries/fw2w0wa2os.mp4" },
  { category: "Clinical Assessments", title: "Lecture: Therapy Localisation", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164866613", video_url: "https://embed-ssl.wistia.com/deliveries/k5puujsko6.mp4" },
  { category: "Clinical Assessments", title: "Lecture: Intention Based Muscle Testing", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164893984", video_url: "https://embed-ssl.wistia.com/deliveries/ijykfrbitq.mp4" },
  { category: "Direct Muscle Tests", title: "Muscle Tests: Intrinsic Stabilisation System", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164756677", video_url: "https://embed-ssl.wistia.com/deliveries/q6p4ngo7j3.mp4" },
  { category: "Direct Muscle Tests", title: "Muscle Tests: Transverse Abdominals", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164655470", video_url: "https://embed-ssl.wistia.com/deliveries/y0hsqrqf3i.mp4" },
  { category: "Direct Muscle Tests", title: "Demo: TVA Muscle Test", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166239953", video_url: "https://embed-ssl.wistia.com/deliveries/h7v038nk76.mp4" },
  { category: "Direct Muscle Tests", title: "Diaphragm", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833384", video_url: "https://embed-ssl.wistia.com/deliveries/fzbtbcjc6u.mp4" },
  { category: "Direct Muscle Tests", title: "Pelvic Floor Muscle Tests", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647569", video_url: "https://embed-ssl.wistia.com/deliveries/dkoab9eenb.mp4" },
  { category: "Direct Muscle Tests", title: "Multifidi", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167418078", video_url: "https://embed-ssl.wistia.com/deliveries/up90dzdxpa.mp4" },
  { category: "Direct Muscle Tests", title: "Sacrospinalis", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833389", video_url: "https://embed-ssl.wistia.com/deliveries/c5p9fbtcgo.mp4" },
  { category: "Direct Muscle Tests", title: "Demo: Quadriceps Group", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166288733", video_url: "https://embed-ssl.wistia.com/deliveries/sccerhmswf.mp4" },
  { category: "Direct Muscle Tests", title: "Deltoids, Mid & Lower Traps, Pecs and Serratus Anterior", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647725", video_url: "https://embed-ssl.wistia.com/deliveries/ojxy4s4wi7.mp4" },
  { category: "Direct Muscle Tests", title: "Biceps and Triceps", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167503394", video_url: "https://embed-ssl.wistia.com/deliveries/0ps5i05z37.mp4" },
  { category: "Beginning Procedures - Sympathetic Down Regulation", title: "Lecture: Beginning Procedure (Sympathetic Down Regulation)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164765571", video_url: "https://embed-ssl.wistia.com/deliveries/vqbbruguk9.mp4" },
  { category: "Beginning Procedures - Sympathetic Down Regulation", title: "Harmonic Rocking", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655471", video_url: "https://embed-ssl.wistia.com/deliveries/uxsgowfa1t.mp4" },
  { category: "Beginning Procedures - Sympathetic Down Regulation", title: "Lecture: T1 - Sympathetic Chain", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164763360", video_url: "https://embed-ssl.wistia.com/deliveries/t3j7gis6yj.mp4" },
  { category: "Beginning Procedures - Sympathetic Down Regulation", title: "T1 - Sympathetic Chain Demonstration", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655472", video_url: "https://embed-ssl.wistia.com/deliveries/6sbicveheu.mp4" },
  { category: "Beginning Procedures - Sympathetic Down Regulation", title: "Lecture: Phrenic Nerve", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164764506", video_url: "https://embed-ssl.wistia.com/deliveries/wj8ac0htji.mp4" },
  { category: "Beginning Procedures - Sympathetic Down Regulation", title: "In Class Demo: Phrenic Nerve", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2192994870", video_url: "https://embed-ssl.wistia.com/deliveries/9g5fehelaz.mp4" },
  { category: "Beginning Procedures - Sympathetic Down Regulation", title: "Phrenic Nerve Demonstration", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164663189", video_url: "https://embed-ssl.wistia.com/deliveries/2zbjbcpy9i.mp4" },
  { category: "Lymphatic System Assessment and Correction", title: "Lecture: Lymphatic System", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164764799", video_url: "https://embed-ssl.wistia.com/deliveries/ql8uazt89s.mp4" },
  { category: "Lymphatic System Assessment and Correction", title: "Lymphatic Cranial Reflex Zone", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2191285451", video_url: "https://embed-ssl.wistia.com/deliveries/90fd1dasvt.mp4" },
  { category: "Lymphatic System Assessment and Correction", title: "Lymphatic Release Positions", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164723635", video_url: "https://embed-ssl.wistia.com/deliveries/gkeq3cc4qv.mp4" },
  { category: "Lymphatic System Assessment and Correction", title: "Lymphatic System Full Procedure", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164719983", video_url: "https://embed-ssl.wistia.com/deliveries/1gf9mymw0k.mp4" },
  { category: "Vagus Nerve", title: "Vagus Nerve Masterclass", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865060", video_url: "https://embed-ssl.wistia.com/deliveries/p7sovcgeva.mp4" },
  { category: "Vagus Nerve", title: "Lecture: Vagus Nerve Procedure", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865138", video_url: "https://embed-ssl.wistia.com/deliveries/qmknwe0gzr.mp4" },
  { category: "Vagus Nerve", title: "Demonstration: Vagus Nerve Screen", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2166291753", video_url: "https://embed-ssl.wistia.com/deliveries/vnuzzo9m5n.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Lecture: Pathway Assessment Process Overview", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164723262", video_url: "https://embed-ssl.wistia.com/deliveries/mxu99boq51.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Lecture: Nociceptive Threat Assessment", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164728792", video_url: "https://embed-ssl.wistia.com/deliveries/grlcunou3s.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Nociceptive Threat Assessment Demonstration", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164726137", video_url: "https://embed-ssl.wistia.com/deliveries/bnxl8yvoz6.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Nociceptive Demo Review", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164772241", video_url: "https://embed-ssl.wistia.com/deliveries/xak39zdtrd.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Lecture: Efferent Pathway Correction", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167444469", video_url: "https://embed-ssl.wistia.com/deliveries/7g1e7ke7fz.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Lecture: Cortical Brain Zones", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167468893", video_url: "https://embed-ssl.wistia.com/deliveries/ootdt2sqt5.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Lecture: Sub-Corticol Brain Zones", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167469166", video_url: "https://embed-ssl.wistia.com/deliveries/dpu0tfv6t3.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Locating the Brain Reflex Areas", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2169356729", video_url: "https://embed-ssl.wistia.com/deliveries/g81sdf4g12.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Lecture: Mechanoreceptor (Conscious)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171239933", video_url: "https://embed-ssl.wistia.com/deliveries/s80z640oe0.mp4" },
  { category: "Pathway Assessments and Corrections", title: "Demo: Mechanoreceptor (Conscious)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171201710", video_url: "https://embed-ssl.wistia.com/deliveries/ebe2dvptg2.mp4" },
  { category: "Primitive Reflexes", title: "Background Information for the Primitive Reflexes", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164792212", video_url: null },
  { category: "Primitive Reflexes", title: "Lecture: Primitive Reflexes Overview", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164760586", video_url: "https://embed-ssl.wistia.com/deliveries/9hmm3ghuge.mp4" },
  { category: "Primitive Reflexes", title: "In Class Demo: Moro Reflex, Startle", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164728867", video_url: "https://embed-ssl.wistia.com/deliveries/9blpsd2r03.mp4" },
  { category: "Primitive Reflexes", title: "In Class Demo: Spinal Gallant Reflex", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2169016216", video_url: "https://embed-ssl.wistia.com/deliveries/au3ie182v1.mp4" },
  { category: "Primitive Reflexes", title: "ATNR Assessment Demo", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729690", video_url: "https://embed-ssl.wistia.com/deliveries/ghu33n9kj0.mp4" },
  { category: "Primitive Reflexes", title: "Tonic Labrynthine Reflex (TLR) Assessment Demo", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729000", video_url: "https://embed-ssl.wistia.com/deliveries/d4uvs2rutq.mp4" },
  { category: "Primitive Reflexes", title: "Fear Paralyis Reflex Demo", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167094242", video_url: "https://embed-ssl.wistia.com/deliveries/riloh8q5pb.mp4" },
  { category: "Primitive Reflexes", title: "Babinski Reflex Demo", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502394", video_url: "https://embed-ssl.wistia.com/deliveries/qln7pma0m2.mp4" },
  { category: "Primitive Reflexes", title: "Moro/Startle Reflex Demo", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502429", video_url: "https://embed-ssl.wistia.com/deliveries/tlegyln1lk.mp4" },
  { category: "Primitive Reflexes", title: "ATNR", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502432", video_url: "https://embed-ssl.wistia.com/deliveries/l1pvo6ipal.mp4" },
  { category: "Postural Reflexes", title: "Occular & Labrythine Righting Reflexes Assessment", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154822754/posts/2175437516", video_url: "https://embed-ssl.wistia.com/deliveries/eghzwenamd.mp4" },
  { category: "Cranial Nerves", title: "Lecture: Cranial Nerves", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2164792486", video_url: "https://embed-ssl.wistia.com/deliveries/plxv1d88us.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve I (Olfactory)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167205372", video_url: "https://embed-ssl.wistia.com/deliveries/7mu5tuh3pr.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve II (Optic Nerve)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779783", video_url: "https://embed-ssl.wistia.com/deliveries/xc447sz742.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve III (Oculomotor)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779787", video_url: "https://embed-ssl.wistia.com/deliveries/c64smaaz7c.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve IV (Trochlear)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779806", video_url: "https://embed-ssl.wistia.com/deliveries/zaiigboej3.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve V (Trigeminal)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780073", video_url: "https://embed-ssl.wistia.com/deliveries/1qeat2j7ld.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve VI (Abducens)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780077", video_url: "https://embed-ssl.wistia.com/deliveries/mfey36i185.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve VII (Facial)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780903", video_url: "https://embed-ssl.wistia.com/deliveries/ys2s3mz2fu.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve VIII (Vestibulo-cochlear)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780911", video_url: "https://embed-ssl.wistia.com/deliveries/v52ffb0y1z.mp4" },
  { category: "Cranial Nerves", title: "Cranial Nerve IX (Glossopharyngeal)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780916", video_url: "https://embed-ssl.wistia.com/deliveries/brkh4p054u.mp4" },
  { category: "Emotional Corrections", title: "Lecture: Emotional Corrections", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2165230137", video_url: "https://embed-ssl.wistia.com/deliveries/iwg08t0k7n.mp4" },
  { category: "Emotional Corrections", title: "In class Lecture and Demo: Emotions", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2172678455", video_url: "https://embed-ssl.wistia.com/deliveries/f1l8gym4ac.mp4" },
  { category: "Emotional Corrections", title: "Demo: Emotional Correction", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2164720410", video_url: "https://embed-ssl.wistia.com/deliveries/wxcumt6yel.mp4" },
  { category: "Finishing Procedures and Home Reinforcement", title: "Lecture: Gaits Integration", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655473", video_url: "https://embed-ssl.wistia.com/deliveries/95jayidy1b.mp4" },
  { category: "Finishing Procedures and Home Reinforcement", title: "Gaits Integration Procedure", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164757718", video_url: "https://embed-ssl.wistia.com/deliveries/d3kn26q09f.mp4" },
  { category: "Finishing Procedures and Home Reinforcement", title: "In class Lecture: Gaits", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2172690792", video_url: "https://embed-ssl.wistia.com/deliveries/ova2orz4v3.mp4" },
  { category: "Finishing Procedures and Home Reinforcement", title: "Things to Check during the session and for Home Reinforcement", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474", video_url: "https://embed-ssl.wistia.com/deliveries/9p9s8iiisa.mp4" },
  { category: "Background Information", title: "Lecture: How the Brain Maps Movement", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2164853086", video_url: "https://embed-ssl.wistia.com/deliveries/iyenik446l.mp4" },
  { category: "Background Information", title: "Chronic Pain and the Brain", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2165118302", video_url: "https://embed-ssl.wistia.com/deliveries/1h4psr6ax8.mp4" },
  { category: "Masterclasses", title: "Vertigo Masterclass - 21/Nov/2023", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2172969132", video_url: "https://embed-ssl.wistia.com/deliveries/nh01u1v7g1.mp4" },
  { category: "Masterclasses", title: "Personal Mindset Mastery Masterclass (Jan 3rd, 2024)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2174007926", video_url: "https://embed-ssl.wistia.com/deliveries/ukinxx5n2f.mp4" },
  { category: "Masterclasses", title: "Neuro Mastery Masterclass: Muscle Testing Nuance and Back Pain Demo", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2187544782", video_url: "https://embed-ssl.wistia.com/deliveries/tj2sgsbddp.mp4" },
  { category: "Masterclasses", title: "Tendon Guard Reflex Masterclass", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2187887358", video_url: "https://embed-ssl.wistia.com/deliveries/ce1ziulvtm.mp4" },
  { category: "Functional Anatomy and Biomechanics", title: "Functional Anatomy Basics of the Saggital Plane", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369485", video_url: "https://embed-ssl.wistia.com/deliveries/83mr423tlx.mp4" },
  { category: "Functional Anatomy and Biomechanics", title: "Functional Anatomy Basics of the Frontal Plane", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369489", video_url: "https://embed-ssl.wistia.com/deliveries/9uyt0t2vh7.mp4" },
  { category: "Functional Anatomy and Biomechanics", title: "Functional Anatomy basics of the Transverse Plane", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369492", video_url: "https://embed-ssl.wistia.com/deliveries/jedwjs7ex0.mp4" },
  { category: "Putting it all Together", title: "Lower Back Pain (In Class Demo)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2176704641", video_url: "https://embed-ssl.wistia.com/deliveries/b8o5ts25yz.mp4" },
  { category: "Putting it all Together", title: "Q and A - 5/8/2025 (STNR test, Navigating Challenging Muscle Tests)", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2187520560", video_url: "https://embed-ssl.wistia.com/deliveries/enc2m9jkst.mp4" },
  { category: "FNH Foundations Exam", title: "FNH Foundations Theory Exam", page_url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2156390136/posts/2182274096", video_url: null },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })

  try {
    const { user_id } = await req.json();
    
    // 1. Clear existing lessons for this user to avoid duplicates
    await supabaseAdmin.from('lessons').delete().eq('user_id', user_id);

    // 2. Map the verified data to the user's lessons table
    const lessonsToInsert = VERIFIED_MAP.map((item: any) => ({
      user_id: user_id,
      lesson_url: item.page_url,
      title: item.title,
      video_url: item.video_url,
      status: item.video_url ? 'completed' : 'failed',
      category: item.category,
    }));
    
    const { error: insertError } = await supabaseAdmin.from('lessons').insert(lessonsToInsert);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: 'Course data synced successfully from verified map.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})