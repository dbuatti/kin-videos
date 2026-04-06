// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COURSE_STRUCTURE = [
  {
    category: "General / Intro",
    lessons: [
      { title: "Resume Course", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474", video_url: "https://embed-ssl.wistia.com/deliveries/fcd1fa9b2e0cd9585565ea43214d78d51e6d28ef.mp4" }
    ]
  },
  {
    category: "Course Introduction & Foundational Knowledge",
    lessons: [
      { title: "Learning Materials", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167681807", video_url: null },
      { title: "About Your Instructor", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655462", video_url: "https://embed-ssl.wistia.com/deliveries/e5a21ab718d5d38897b67e5198e4a4a0de7a8e2f.mp4" },
      { title: "Overview of the Approach", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655465", video_url: "https://embed-ssl.wistia.com/deliveries/5e942a70cbfc426869d23a830a97c2a40e039ff9.mp4" },
      { title: "Performance Iceberg", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167257485", video_url: "https://embed-ssl.wistia.com/deliveries/b0ac85ac3c52d5d2ad43c4c9a71e80d6.mp4" },
      { title: "Neurophysiology 101", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655463", video_url: "https://embed-ssl.wistia.com/deliveries/7f7b905558ab660388a5c7857cda8e6f.mp4" },
      { title: "3 Stages of Stress", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622397", video_url: "https://embed-ssl.wistia.com/deliveries/8df63fab7d036034f3391890f34ec4c1.mp4" },
      { title: "Threat Neurophysiology", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622399", video_url: "https://embed-ssl.wistia.com/deliveries/08890a205def390372cc741fe20f5c9d47980c9f.mp4" },
      { title: "Autonomic Nervous System Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167679824", video_url: null }
    ]
  },
  {
    category: "Clinical Assessments",
    lessons: [
      { title: "BOLT Test", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167251417", video_url: "https://embed-ssl.wistia.com/deliveries/ce764cc10222173fa80c6d8c6a3d90210f4cf1a1.mp4" },
      { title: "Breathing Assessment Quiz", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167619695", video_url: null },
      { title: "Lecture: Muscle Testing Fundamentals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164865269", video_url: "https://embed-ssl.wistia.com/deliveries/e37292d9950da2bf0a17301a86271c77.mp4" },
      { title: "Muscle Testing Quiz", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2173091485", video_url: null },
      { title: "Demo: Indicator Muscle Fundamentals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167415588", video_url: "https://embed-ssl.wistia.com/deliveries/9b7a8027aac01cf743b0cbaa06ae280b.mp4" },
      { title: "Lecture: Therapy Localisation", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164866613", video_url: "https://embed-ssl.wistia.com/deliveries/c8c8b7fdde09fd3b913b8dc8bba6867c.mp4" },
      { title: "Lecture: Intention Based Muscle Testing", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164893984", video_url: "https://embed-ssl.wistia.com/deliveries/d184f429aeadf32399cea00daff99282.mp4" }
    ]
  },
  {
    category: "Direct Muscle Tests",
    lessons: [
      { title: "Muscle Tests: Intrinsic Stabilisation System", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164756677", video_url: "https://embed-ssl.wistia.com/deliveries/364abce3a360a7845926d9d775c0b462.mp4" },
      { title: "Muscle Tests: Transverse Abdominals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164655470", video_url: "https://embed-ssl.wistia.com/deliveries/6b766a1d79b608a860d8b0b4886befb7.mp4" },
      { title: "Demo: TVA Muscle Test", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166239953", video_url: "https://embed-ssl.wistia.com/deliveries/06654b19dfccfcb0bf7333a032825f4a.mp4" },
      { title: "Diaphragm", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833384", video_url: "https://embed-ssl.wistia.com/deliveries/9813e62a13a7ef09e17f7a16e5ca810b096b5ed2.mp4" },
      { title: "Pelvic Floor Muscle Tests", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647569", video_url: "https://embed-ssl.wistia.com/deliveries/57cf210cb9ae6a0aa951271be09f0f33.mp4" },
      { title: "Multifidi", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167418078", video_url: "https://embed-ssl.wistia.com/deliveries/2630882e5679cf0ec3b82ea50047b8490aeebf16.mp4" },
      { title: "Sacrospinalis", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833389", video_url: "https://embed-ssl.wistia.com/deliveries/67f55210add07eaec9dbcde9a093d5e8589d3a37.mp4" },
      { title: "Demo: Quadriceps Group", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166288733", video_url: "https://embed-ssl.wistia.com/deliveries/e3568b13d3b8ecaa2e2c7e363a064435.mp4" },
      { title: "Deltoids, Mid & Lower Traps, Pecs and Serratus Anterior", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647725", video_url: "https://embed-ssl.wistia.com/deliveries/8dc68372fa942300d450b03ec8487454cacb02c7.mp4" },
      { title: "Biceps and Triceps", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167503394", video_url: "https://embed-ssl.wistia.com/deliveries/006270ae8c685161a8a2c55053ee0fd5ecf69b18.mp4" }
    ]
  },
  {
    category: "Beginning Procedures - Sympathetic Down Regulation",
    lessons: [
      { title: "Lecture: Beginning Procedure (Sympathetic Down Regulation)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164765571", video_url: "https://embed-ssl.wistia.com/deliveries/fb89c1759fbb08c91ed375ffb8a56c8a227eae56.mp4" },
      { title: "Harmonic Rocking", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655471", video_url: "https://embed-ssl.wistia.com/deliveries/a8c771702cf0998e7caee0f064316544.mp4" },
      { title: "Lecture: T1 - Sympathetic Chain", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164763360", video_url: "https://embed-ssl.wistia.com/deliveries/7c00ec58add6be2aee32e14d203e1ad3.mp4" },
      { title: "T1 - Sympathetic Chain Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655472", video_url: "https://embed-ssl.wistia.com/deliveries/ac0d803e766ec7535b8b981303df93bcc177c920.mp4" },
      { title: "Lecture: Phrenic Nerve", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164764506", video_url: "https://embed-ssl.wistia.com/deliveries/140c1d17f4eb8afbc7ea1e29fedcb7e7.mp4" },
      { title: "In Class Demo: Phrenic Nerve", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2192994870", video_url: "https://embed-ssl.wistia.com/deliveries/5b36605cc4109d6c88a934231963c6d11e94c22b.mp4" },
      { title: "Phrenic Nerve Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164663189", video_url: "https://embed-ssl.wistia.com/deliveries/fc38346a4cb0b8fd1fa8cfba2a74102ed3d5a641.mp4" }
    ]
  },
  {
    category: "Lymphatic System Assessment and Correction",
    lessons: [
      { title: "Lecture: Lymphatic System", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164764799", video_url: "https://embed-ssl.wistia.com/deliveries/57b0be805ff3539e9b8892ebef2ead99.mp4" },
      { title: "Lymphatic Cranial Reflex Zone", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2191285451", video_url: "https://embed-ssl.wistia.com/deliveries/08dcfc80453cd9a1a10f7dc9940ab0b2f16f206e.mp4" },
      { title: "Lymphatic Release Positions", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164723635", video_url: "https://embed-ssl.wistia.com/deliveries/4b7c5c29f3e15bf49762d7f9f34bc246133eb924.mp4" },
      { title: "Lymphatic System Full Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164719983", video_url: "https://embed-ssl.wistia.com/deliveries/ba06079f4c7f3429554fe6c97a8e8cf0b8e48460.mp4" }
    ]
  },
  {
    category: "Vagus Nerve",
    lessons: [
      { title: "Vagus Nerve Masterclass", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865060", video_url: "https://embed-ssl.wistia.com/deliveries/cc54a87622fa51b31e28f8ec63db323b.mp4" },
      { title: "Lecture: Vagus Nerve Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865138", video_url: "https://embed-ssl.wistia.com/deliveries/e107ed3db9578a55bf57d6e05f5deeb4.mp4" },
      { title: "Demonstration: Vagus Nerve Screen", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2166291753", video_url: "https://embed-ssl.wistia.com/deliveries/fde31242dde2c7536f59b7c3a46f6070.mp4" }
    ]
  },
  {
    category: "Pathway Assessments and Corrections",
    lessons: [
      { title: "Lecture: Pathway Assessment Process Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164723262", video_url: "https://embed-ssl.wistia.com/deliveries/55a0f86087e5c17de9faadeefdd8ee51.mp4" },
      { title: "Lecture: Nociceptive Threat Assessment", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164728792", video_url: "https://embed-ssl.wistia.com/deliveries/c429c851a4ba8da06e7496f3a707286c.mp4" },
      { title: "Nociceptive Threat Assessment Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164726137", video_url: "https://embed-ssl.wistia.com/deliveries/09ca171520ee772d6a31ba5602e9e1f328ca4b65.mp4" },
      { title: "Nociceptive Demo Review", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164772241", video_url: "https://embed-ssl.wistia.com/deliveries/aa43654593f3093f2a4fffbe3b9b9d8f.mp4" },
      { title: "Lecture: Efferent Pathway Correction", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167444469", video_url: "https://embed-ssl.wistia.com/deliveries/c073a34e30bab8435cf686fcf41a19f8.mp4" },
      { title: "Lecture: Cortical Brain Zones", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167468893", video_url: "https://embed-ssl.wistia.com/deliveries/9e055a1ca5d1c3ccbf779da2619d0b32.mp4" },
      { title: "Lecture: Sub-Corticol Brain Zones", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167469166", video_url: "https://embed-ssl.wistia.com/deliveries/f51219398c512c17889b57e265ec67f2.mp4" },
      { title: "Locating the Brain Reflex Areas", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2169356729", video_url: "https://embed-ssl.wistia.com/deliveries/eea1515ab5542c401c5c77f8076748d433ba76b7.mp4" },
      { title: "Lecture: Mechanoreceptor (Conscious)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171239933", video_url: "https://embed-ssl.wistia.com/deliveries/a2452372e3fc3ebc703bd5ee39b5912d.mp4" },
      { title: "Demo: Mechanoreceptor (Conscious)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171201710", video_url: "https://embed-ssl.wistia.com/deliveries/076585afb879fbd326958b2ceed1f696e6464254.mp4" }
    ]
  },
  {
    category: "Primitive Reflexes",
    lessons: [
      { title: "Background Information for the Primitive Reflexes", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164792212", video_url: null },
      { title: "Lecture: Primitive Reflexes Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164760586", video_url: "https://embed-ssl.wistia.com/deliveries/b94e227227785f7fde1c5d99a05a7c80.mp4" },
      { title: "In Class Demo: Moro Reflex, Startle", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164728867", video_url: "https://embed-ssl.wistia.com/deliveries/09992becc69fc18767252d9048037fb58b3e59de.mp4" },
      { title: "In Class Demo: Spinal Gallant Reflex", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2169016216", video_url: "https://embed-ssl.wistia.com/deliveries/ace191c3994201b6b30d5d5ba6a88f88834f537d.mp4" },
      { title: "ATNR Assessment Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729690", video_url: "https://embed-ssl.wistia.com/deliveries/2f5b24fd1d3184a98d2e9c5b5ff1fff6be8bdb07.mp4" },
      { title: "Tonic Labrynthine Reflex (TLR) Assessment Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729000", video_url: "https://embed-ssl.wistia.com/deliveries/710dba831b6b97eb558e3e4f1ad866800076dd0b.mp4" },
      { title: "Fear Paralyis Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167094242", video_url: "https://embed-ssl.wistia.com/deliveries/7d40f82dbdf33d51bdc9195adec04a9d0e8b5c7f.mp4" },
      { title: "Babinski Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502394", video_url: "https://embed-ssl.wistia.com/deliveries/18739c5ea2d71bafc1e674974e51ad0408c2bae2.mp4" },
      { title: "Moro/Startle Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502429", video_url: "https://embed-ssl.wistia.com/deliveries/7bee9c3cc03da234cda80dfd2f796c3a80b55414.mp4" },
      { title: "ATNR", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502432", video_url: "https://embed-ssl.wistia.com/deliveries/896c250c771ff9c61de1176371bcaa86882f7685.mp4" }
    ]
  },
  {
    category: "Postural Reflexes",
    lessons: [
      { title: "Occular & Labrythine Righting Reflexes Assessment", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154822754/posts/2175437516", video_url: "https://embed-ssl.wistia.com/deliveries/d91e9aea886dd9611199161bad9c472ee993464c.mp4" }
    ]
  },
  {
    category: "Cranial Nerves",
    lessons: [
      { title: "Lecture: Cranial Nerves", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2164792486", video_url: "https://embed-ssl.wistia.com/deliveries/eff3c4639f49f29eba770402add63a63.mp4" },
      { title: "Cranial Nerve I (Olfactory)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167205372", video_url: "https://embed-ssl.wistia.com/deliveries/aca41508634a068fbda3d10c96f150a9.mp4" },
      { title: "Cranial Nerve II (Optic Nerve)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779783", video_url: "https://embed-ssl.wistia.com/deliveries/b874823f0dc614160512b66bcb5b516f50f9eb2d.mp4" },
      { title: "Cranial Nerve III (Oculomotor)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779787", video_url: "https://embed-ssl.wistia.com/deliveries/e469a668620604adbb0a0c69a192e7af50579078.mp4" },
      { title: "Cranial Nerve IV (Trochlear)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779806", video_url: "https://embed-ssl.wistia.com/deliveries/e469a668620604adbb0a0c69a192e7af50579078.mp4" },
      { title: "Cranial Nerve V (Trigeminal)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780073", video_url: "https://embed-ssl.wistia.com/deliveries/10de3ccab1d8595c4c3e451aea5b91c84cf6213f.mp4" },
      { title: "Cranial Nerve VI (Abducens)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780077", video_url: "https://embed-ssl.wistia.com/deliveries/e469a668620604adbb0a0c69a192e7af50579078.mp4" },
      { title: "Cranial Nerve VII (Facial)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780903", video_url: "https://embed-ssl.wistia.com/deliveries/e80792dddb73e4f494dd7f56a6cb1958e571e5ae.mp4" },
      { title: "Cranial Nerve VIII (Vestibulo-cochlear)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780911", video_url: "https://embed-ssl.wistia.com/deliveries/465c56ed15ec74012154656cd87ff84d9307a40c.mp4" },
      { title: "Cranial Nerve IX (Glossopharyngeal)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780916", video_url: "https://embed-ssl.wistia.com/deliveries/c951c07cedadced7e1d2291c60a8dc22d90ac90a.mp4" }
    ]
  },
  {
    category: "Emotional Corrections",
    lessons: [
      { title: "Lecture: Emotional Corrections", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2165230137", video_url: "https://embed-ssl.wistia.com/deliveries/8ddc33c93e37dbd198427d6c7da016a7.mp4" },
      { title: "In class Lecture and Demo: Emotions", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2172678455", video_url: "https://embed-ssl.wistia.com/deliveries/74f72fb98cf3019e50d1e310df99a4ef93cc2b19.mp4" },
      { title: "Demo: Emotional Correction", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2164720410", video_url: "https://embed-ssl.wistia.com/deliveries/cad0e20b489871a2997a21059ac906c6dd508784.mp4" }
    ]
  },
  {
    category: "Finishing Procedures and Home Reinforcement",
    lessons: [
      { title: "Lecture: Gaits Integration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655473", video_url: "https://embed-ssl.wistia.com/deliveries/fb56b63684af8fb13393a96766003f79.mp4" },
      { title: "Gaits Integration Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164757718", video_url: "https://embed-ssl.wistia.com/deliveries/14f550f77b125c6afb95ef30dd7bb5cafccc62c1.mp4" },
      { title: "In class Lecture: Gaits", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2172690792", video_url: "https://embed-ssl.wistia.com/deliveries/cb71913262c6189738b009feeae179eb5ca0d273.mp4" },
      { title: "Things to Check during the session and for Home Reinforcement", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474", video_url: "https://embed-ssl.wistia.com/deliveries/fcd1fa9b2e0cd9585565ea43214d78d51e6d28ef.mp4" }
    ]
  },
  {
    category: "Background Information",
    lessons: [
      { title: "Lecture: How the Brain Maps Movement", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2164853086", video_url: "https://embed-ssl.wistia.com/deliveries/243cd0fc59634489307c00201705599a.mp4" },
      { title: "Chronic Pain and the Brain", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2165118302", video_url: "https://embed-ssl.wistia.com/deliveries/270b4bf082b552acd2e8405766865adf.mp4" }
    ]
  },
  {
    category: "Masterclasses",
    lessons: [
      { title: "Vertigo Masterclass - 21/Nov/2023", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2172969132", video_url: "https://embed-ssl.wistia.com/deliveries/527fc8abdc7e4e3ab93029c86fb02341.mp4" },
      { title: "Personal Mindset Mastery Masterclass (Jan 3rd, 2024)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2174007926", video_url: "https://embed-ssl.wistia.com/deliveries/835805a30a5914703a2022414f48fe50.mp4" },
      { title: "Neuro Mastery Masterclass: Muscle Testing Nuance and Back Pain Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2187544782", video_url: "https://embed-ssl.wistia.com/deliveries/4372236e5853d61e7149d1f88bb894a8.mp4" },
      { title: "Tendon Guard Reflex Masterclass", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2187887358", video_url: "https://embed-ssl.wistia.com/deliveries/f8a82bc9595b550236df6e27afc75356.mp4" }
    ]
  },
  {
    category: "Functional Anatomy and Biomechanics",
    lessons: [
      { title: "Functional Anatomy Basics of the Saggital Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369485", video_url: "https://embed-ssl.wistia.com/deliveries/6be7f23b2ea21a8291a7f4d5b0e489a9af0b4566.mp4" },
      { title: "Functional Anatomy Basics of the Frontal Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369489", video_url: "https://embed-ssl.wistia.com/deliveries/94038e6917bcc3648be5af16fde2c44c81f60b2b.mp4" },
      { title: "Functional Anatomy basics of the Transverse Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369492", video_url: "https://embed-ssl.wistia.com/deliveries/bb80583185b4618d3ee4ddf8cfefc1c7c60ae4a8.mp4" }
    ]
  },
  {
    category: "Putting it all Together",
    lessons: [
      { title: "Lower Back Pain (In Class Demo)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2176704641", video_url: "https://embed-ssl.wistia.com/deliveries/92d89b854b608145eba07a77eb734b8421a4bdba.mp4" },
      { title: "Q and A - 5/8/2025 (STNR test, Navigating Challenging Muscle Tests)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2187520560", video_url: "https://embed-ssl.wistia.com/deliveries/0ac1da7790c7d8bff65b957bcad11e0a.mp4" }
    ]
  },
  {
    category: "FNH Foundations Exam",
    lessons: [
      { title: "FNH Foundations Theory Exam", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2156390136/posts/2182274096", video_url: null }
    ]
  }
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
    
    // Clear existing lessons for this user to avoid duplicates
    await supabaseAdmin.from('lessons').delete().eq('user_id', user_id);

    const lessonsToInsert = [];
    for (const module of COURSE_STRUCTURE) {
      for (const lesson of module.lessons) {
        lessonsToInsert.push({
          user_id: user_id,
          lesson_url: lesson.url,
          title: lesson.title,
          video_url: lesson.video_url,
          status: lesson.video_url ? 'completed' : 'failed',
          category: module.category,
        });
      }
    }
    
    const { error } = await supabaseAdmin.from('lessons').insert(lessonsToInsert);
    if (error) throw error;

    return new Response(JSON.stringify({ message: 'Course data synced successfully.' }), {
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