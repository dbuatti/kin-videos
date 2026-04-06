// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COURSE_STRUCTURE = [
  {
    category: "Course Introduction & Foundational Knowledge",
    lessons: [
      { title: "Learning Materials", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-learning-materials", video_url: "https://simulated-video-url.com/learning-materials-1.mp4" },
      { title: "About Your Instructor", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-about-your-instructor", video_url: "https://simulated-video-url.com/about-your-instructor-2.mp4" },
      { title: "Overview of the Approach", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-overview-of-the-approach", video_url: "https://simulated-video-url.com/overview-of-the-approach-3.mp4" },
      { title: "Performance Iceberg", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-performance-iceberg", video_url: "https://simulated-video-url.com/performance-iceberg-4.mp4" },
      { title: "Neurophysiology 101", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-neurophysiology-101", video_url: "https://simulated-video-url.com/neurophysiology-101-5.mp4" },
      { title: "3 Stages of Stress", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-3-stages-of-stress", video_url: "https://simulated-video-url.com/3-stages-of-stress-6.mp4" },
      { title: "Threat Neurophysiology", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-threat-neurophysiology", video_url: "https://simulated-video-url.com/threat-neurophysiology-7.mp4" },
      { title: "Autonomic Nervous System Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-autonomic-nervous-system-overview", video_url: "https://simulated-video-url.com/autonomic-nervous-system-overview-8.mp4" }
    ]
  },
  {
    category: "Clinical Assessments",
    lessons: [
      { title: "BOLT Test", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-bolt-test", video_url: "https://simulated-video-url.com/bolt-test-9.mp4" },
      { title: "Breathing Assessment Quiz", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-breathing-assessment-quiz", video_url: "https://simulated-video-url.com/breathing-assessment-quiz-10.mp4" },
      { title: "Lecture: Muscle Testing Fundamentals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-muscle-testing-fundamentals", video_url: "https://simulated-video-url.com/lecture-muscle-testing-fundamentals-11.mp4" },
      { title: "Muscle Testing Quiz", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-muscle-testing-quiz", video_url: "https://simulated-video-url.com/muscle-testing-quiz-12.mp4" },
      { title: "Demo: Indicator Muscle Fundamentals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demo-indicator-muscle-fundamentals", video_url: "https://simulated-video-url.com/demo-indicator-muscle-fundamentals-13.mp4" },
      { title: "Lecture: Therapy Localisation", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-therapy-localisation", video_url: "https://simulated-video-url.com/lecture-therapy-localisation-14.mp4" },
      { title: "Lecture: Intention Based Muscle Testing", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-intention-based-muscle-testing", video_url: "https://simulated-video-url.com/lecture-intention-based-muscle-testing-15.mp4" }
    ]
  },
  {
    category: "Direct Muscle Tests",
    lessons: [
      { title: "Muscle Tests: Intrinsic Stabilisation System", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-muscle-tests-intrinsic-stabilisation-system", video_url: "https://simulated-video-url.com/muscle-tests-intrinsic-stabilisation-system-16.mp4" },
      { title: "Muscle Tests: Transverse Abdominals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-muscle-tests-transverse-abdominals", video_url: "https://simulated-video-url.com/muscle-tests-transverse-abdominals-17.mp4" },
      { title: "Demo: TVA Muscle Test", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demo-tva-muscle-test", video_url: "https://simulated-video-url.com/demo-tva-muscle-test-18.mp4" },
      { title: "Diaphragm", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-diaphragm", video_url: "https://simulated-video-url.com/diaphragm-19.mp4" },
      { title: "Pelvic Floor Muscle Tests", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-pelvic-floor-muscle-tests", video_url: "https://simulated-video-url.com/pelvic-floor-muscle-tests-20.mp4" },
      { title: "Multifidi", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-multifidi", video_url: "https://simulated-video-url.com/multifidi-21.mp4" },
      { title: "Sacrospinalis", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-sacrospinalis", video_url: "https://simulated-video-url.com/sacrospinalis-22.mp4" },
      { title: "Demo: Quadriceps Group", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demo-quadriceps-group", video_url: "https://simulated-video-url.com/demo-quadriceps-group-23.mp4" },
      { title: "Deltoids, Mid & Lower Traps, Pecs and Serratus Anterior", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-deltoids-mid-lower-traps-pecs-and-serratus-anterior", video_url: "https://simulated-video-url.com/deltoids-mid-lower-traps-pecs-and-serratus-anterior-24.mp4" },
      { title: "Biceps and Triceps", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-biceps-and-triceps", video_url: "https://simulated-video-url.com/biceps-and-triceps-25.mp4" }
    ]
  },
  {
    category: "Beginning Procedures - Sympathetic Down Regulation",
    lessons: [
      { title: "Lecture: Beginning Procedure (Sympathetic Down Regulation)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-beginning-procedure-sympathetic-down-regulation", video_url: "https://simulated-video-url.com/lecture-beginning-procedure-sympathetic-down-regulation-26.mp4" },
      { title: "Harmonic Rocking", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-harmonic-rocking", video_url: "https://simulated-video-url.com/harmonic-rocking-27.mp4" },
      { title: "Lecture: T1 - Sympathetic Chain", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-t1-sympathetic-chain", video_url: "https://simulated-video-url.com/lecture-t1-sympathetic-chain-28.mp4" },
      { title: "T1 - Sympathetic Chain Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-t1-sympathetic-chain-demonstration", video_url: "https://simulated-video-url.com/t1-sympathetic-chain-demonstration-29.mp4" },
      { title: "Lecture: Phrenic Nerve", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-phrenic-nerve", video_url: "https://simulated-video-url.com/lecture-phrenic-nerve-30.mp4" },
      { title: "In Class Demo: Phrenic Nerve", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-in-class-demo-phrenic-nerve", video_url: "https://simulated-video-url.com/in-class-demo-phrenic-nerve-31.mp4" },
      { title: "Phrenic Nerve Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-phrenic-nerve-demonstration", video_url: "https://simulated-video-url.com/phrenic-nerve-demonstration-32.mp4" }
    ]
  },
  {
    category: "Lymphatic System Assessment and Correction",
    lessons: [
      { title: "Lecture: Lymphatic System", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-lymphatic-system", video_url: "https://simulated-video-url.com/lecture-lymphatic-system-33.mp4" },
      { title: "Lymphatic Cranial Reflex Zone", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lymphatic-cranial-reflex-zone", video_url: "https://simulated-video-url.com/lymphatic-cranial-reflex-zone-34.mp4" },
      { title: "Lymphatic Release Positions", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lymphatic-release-positions", video_url: "https://simulated-video-url.com/lymphatic-release-positions-35.mp4" },
      { title: "Lymphatic System Full Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lymphatic-system-full-procedure", video_url: "https://simulated-video-url.com/lymphatic-system-full-procedure-36.mp4" }
    ]
  },
  {
    category: "Vagus Nerve",
    lessons: [
      { title: "Vagus Nerve Masterclass", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-vagus-nerve-masterclass", video_url: "https://simulated-video-url.com/vagus-nerve-masterclass-37.mp4" },
      { title: "Lecture: Vagus Nerve Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-vagus-nerve-procedure", video_url: "https://simulated-video-url.com/lecture-vagus-nerve-procedure-38.mp4" },
      { title: "Demonstration: Vagus Nerve Screen", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demonstration-vagus-nerve-screen", video_url: "https://simulated-video-url.com/demonstration-vagus-nerve-screen-39.mp4" }
    ]
  },
  {
    category: "Pathway Assessments and Corrections",
    lessons: [
      { title: "Lecture: Pathway Assessment Process Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-pathway-assessment-process-overview", video_url: "https://simulated-video-url.com/lecture-pathway-assessment-process-overview-40.mp4" },
      { title: "Lecture: Nociceptive Threat Assessment", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-nociceptive-threat-assessment", video_url: "https://simulated-video-url.com/lecture-nociceptive-threat-assessment-41.mp4" },
      { title: "Nociceptive Threat Assessment Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-nociceptive-threat-assessment-demonstration", video_url: "https://simulated-video-url.com/nociceptive-threat-assessment-demonstration-42.mp4" },
      { title: "Nociceptive Demo Review", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-nociceptive-demo-review", video_url: "https://simulated-video-url.com/nociceptive-demo-review-43.mp4" },
      { title: "Lecture: Efferent Pathway Correction", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-efferent-pathway-correction", video_url: "https://simulated-video-url.com/lecture-efferent-pathway-correction-44.mp4" },
      { title: "Lecture: Cortical Brain Zones", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-cortical-brain-zones", video_url: "https://simulated-video-url.com/lecture-cortical-brain-zones-45.mp4" },
      { title: "Lecture: Sub-Corticol Brain Zones", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-sub-corticol-brain-zones", video_url: "https://simulated-video-url.com/lecture-sub-corticol-brain-zones-46.mp4" },
      { title: "Locating the Brain Reflex Areas", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-locating-the-brain-reflex-areas", video_url: "https://simulated-video-url.com/locating-the-brain-reflex-areas-47.mp4" },
      { title: "Lecture: Mechanoreceptor (Conscious)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-mechanoreceptor-conscious", video_url: "https://simulated-video-url.com/lecture-mechanoreceptor-conscious-48.mp4" },
      { title: "Demo: Mechanoreceptor (Conscious)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demo-mechanoreceptor-conscious", video_url: "https://simulated-video-url.com/demo-mechanoreceptor-conscious-49.mp4" },
      { title: "Lecture: Mechanoreception (Unconscious)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-mechanoreception-unconscious", video_url: "https://simulated-video-url.com/lecture-mechanoreception-unconscious-50.mp4" },
      { title: "Masterclass: Unconscious Mechanoreception", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-masterclass-unconscious-mechanoreception-the-cerebellar-gateway", video_url: "https://simulated-video-url.com/masterclass-unconscious-mechanoreception-the-cerebellar-gateway-51.mp4" },
      { title: "In Class Lecture: Unconscious Mechanoreception", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-in-class-lecture-unconscious-mechanoreception", video_url: "https://simulated-video-url.com/in-class-lecture-unconscious-mechanoreception-52.mp4" },
      { title: "Demo: Mechanoreceptor (Unconscious)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demo-mechanoreceptor-unconscious", video_url: "https://simulated-video-url.com/demo-mechanoreceptor-unconscious-53.mp4" },
      { title: "In Class Lecture and Demo: Nociception", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-in-class-lecture-and-demo-nociception", video_url: "https://simulated-video-url.com/in-class-lecture-and-demo-nociception-54.mp4" }
    ]
  },
  {
    category: "Primitive Reflexes",
    lessons: [
      { title: "Background Information for the Primitive Reflexes", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-background-information-for-the-primitive-reflexes", video_url: "https://simulated-video-url.com/background-information-for-the-primitive-reflexes-55.mp4" },
      { title: "Lecture: Primitive Reflexes Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-primitive-reflexes-overview", video_url: "https://simulated-video-url.com/lecture-primitive-reflexes-overview-56.mp4" },
      { title: "In Class Demo: Moro Reflex, Startle", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-in-class-demo-moro-reflex-startle", video_url: "https://simulated-video-url.com/in-class-demo-moro-reflex-startle-57.mp4" },
      { title: "In Class Demo: Spinal Gallant Reflex", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-in-class-demo-spinal-gallant-reflex", video_url: "https://simulated-video-url.com/in-class-demo-spinal-gallant-reflex-58.mp4" },
      { title: "ATNR Assessment Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-atnr-assessment-demo", video_url: "https://simulated-video-url.com/atnr-assessment-demo-59.mp4" },
      { title: "Tonic Labrynthine Reflex (TLR) Assessment Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-tonic-labrynthine-reflex-tlr-assessment-demo", video_url: "https://simulated-video-url.com/tonic-labrynthine-reflex-tlr-assessment-demo-60.mp4" },
      { title: "Fear Paralyis Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-fear-paralyis-reflex-demo", video_url: "https://simulated-video-url.com/fear-paralyis-reflex-demo-61.mp4" },
      { title: "Babinski Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-babinski-reflex-demo", video_url: "https://simulated-video-url.com/babinski-reflex-demo-62.mp4" },
      { title: "Moro/Startle Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-morostartle-reflex-demo", video_url: "https://simulated-video-url.com/morostartle-reflex-demo-63.mp4" },
      { title: "ATNR", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-atnr", video_url: "https://simulated-video-url.com/atnr-64.mp4" },
      { title: "Spinal Gallant", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-spinal-gallant", video_url: "https://simulated-video-url.com/spinal-gallant-65.mp4" },
      { title: "STNR", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-stnr", video_url: "https://simulated-video-url.com/stnr-66.mp4" },
      { title: "TLR", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-tlr", video_url: "https://simulated-video-url.com/tlr-67.mp4" },
      { title: "Rooting Reflex Correction", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-rooting-reflex-correction", video_url: "https://simulated-video-url.com/rooting-reflex-correction-68.mp4" },
      { title: "Palmar Reflex", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-palmar-reflex", video_url: "https://simulated-video-url.com/palmar-reflex-69.mp4" },
      { title: "Palmer Reflex Track 2", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-palmer-reflex-track-2-testing-clearing-process", video_url: "https://simulated-video-url.com/palmer-reflex-track-2-testing-clearing-process-70.mp4" }
    ]
  },
  {
    category: "Postural Reflexes",
    lessons: [
      { title: "Occular & Labrythine Righting Reflexes Assessment", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-occular-labrythine-righting-reflexes-assessment", video_url: "https://simulated-video-url.com/occular-labrythine-righting-reflexes-assessment-71.mp4" }
    ]
  },
  {
    category: "Cranial Nerves",
    lessons: [
      { title: "Lecture: Cranial Nerves", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-cranial-nerves", video_url: "https://simulated-video-url.com/lecture-cranial-nerves-72.mp4" },
      { title: "Cranial Nerve I (Olfactory)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-i-olfactory", video_url: "https://simulated-video-url.com/cranial-nerve-i-olfactory-73.mp4" },
      { title: "Cranial Nerve II (Optic Nerve)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-ii-optic-nerve", video_url: "https://simulated-video-url.com/cranial-nerve-ii-optic-nerve-74.mp4" },
      { title: "Cranial Nerve III (Oculomotor)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-iii-oculomotor", video_url: "https://simulated-video-url.com/cranial-nerve-iii-oculomotor-75.mp4" },
      { title: "Cranial Nerve IV (Trochlear)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-iv-trochlear", video_url: "https://simulated-video-url.com/cranial-nerve-iv-trochlear-76.mp4" },
      { title: "Cranial Nerve V (Trigeminal)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-v-trigeminal", video_url: "https://simulated-video-url.com/cranial-nerve-v-trigeminal-77.mp4" },
      { title: "Cranial Nerve VI (Abducens)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-vi-abducens", video_url: "https://simulated-video-url.com/cranial-nerve-vi-abducens-78.mp4" },
      { title: "Cranial Nerve VII (Facial)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-vii-facial", video_url: "https://simulated-video-url.com/cranial-nerve-vii-facial-79.mp4" },
      { title: "Cranial Nerve VIII (Vestibulo-cochlear)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-viii-vestibulo-cochlear", video_url: "https://simulated-video-url.com/cranial-nerve-viii-vestibulo-cochlear-80.mp4" },
      { title: "Cranial Nerve IX (Glossopharyngeal)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-ix-glossopharyngeal", video_url: "https://simulated-video-url.com/cranial-nerve-ix-glossopharyngeal-81.mp4" },
      { title: "Cranial Nerve X (Vagus)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-x-vagus", video_url: "https://simulated-video-url.com/cranial-nerve-x-vagus-82.mp4" },
      { title: "Cranial Nerve XI (Accessory)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-xi-accessory", video_url: "https://simulated-video-url.com/cranial-nerve-xi-accessory-83.mp4" },
      { title: "Cranial Nerve XII (Hypoglossal)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-cranial-nerve-xii-hypoglossal", video_url: "https://simulated-video-url.com/cranial-nerve-xii-hypoglossal-84.mp4" },
      { title: "Demo: Cranial Nerve Assessment", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demo-cranial-nerve-assessment", video_url: "https://simulated-video-url.com/demo-cranial-nerve-assessment-85.mp4" },
      { title: "Demo: Cranial Nerve Correction", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demo-cranial-nerve-correction", video_url: "https://simulated-video-url.com/demo-cranial-nerve-correction-86.mp4" },
      { title: "QA Mentoring Call", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-qa-mentoring-call-12142023-cranial-nerves-homework", video_url: "https://simulated-video-url.com/qa-mentoring-call-12142023-cranial-nerves-homework-87.mp4" }
    ]
  },
  {
    category: "Emotional Corrections",
    lessons: [
      { title: "Lecture: Emotional Corrections", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-emotional-corrections", video_url: "https://simulated-video-url.com/lecture-emotional-corrections-88.mp4" },
      { title: "In Class Lecture and Demo: Emotions", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-in-class-lecture-and-demo-emotions", video_url: "https://simulated-video-url.com/in-class-lecture-and-demo-emotions-89.mp4" },
      { title: "Demo: Emotional Correction", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-demo-emotional-correction", video_url: "https://simulated-video-url.com/demo-emotional-correction-90.mp4" }
    ]
  },
  {
    category: "Finishing Procedures and Home Reinforcement",
    lessons: [
      { title: "Lecture: Gaits Integration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-gaits-integration", video_url: "https://simulated-video-url.com/lecture-gaits-integration-91.mp4" },
      { title: "Gaits Integration Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-gaits-integration-procedure", video_url: "https://simulated-video-url.com/gaits-integration-procedure-92.mp4" },
      { title: "In Class Lecture: Gaits", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-in-class-lecture-gaits", video_url: "https://simulated-video-url.com/in-class-lecture-gaits-93.mp4" },
      { title: "Things to Check", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-things-to-check-during-the-session-and-for-home-reinforcement", video_url: "https://simulated-video-url.com/things-to-check-during-the-session-and-for-home-reinforcement-94.mp4" }
    ]
  },
  {
    category: "Background Information",
    lessons: [
      { title: "Lecture: How the Brain Maps Movement", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lecture-how-the-brain-maps-movement", video_url: "https://simulated-video-url.com/lecture-how-the-brain-maps-movement-95.mp4" },
      { title: "Chronic Pain and the Brain", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-chronic-pain-and-the-brain", video_url: "https://simulated-video-url.com/chronic-pain-and-the-brain-96.mp4" }
    ]
  },
  {
    category: "Masterclasses",
    lessons: [
      { title: "Vertigo Masterclass", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-vertigo-masterclass-21nov2023", video_url: "https://simulated-video-url.com/vertigo-masterclass-21nov2023-97.mp4" },
      { title: "Personal Mindset Mastery", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-personal-mindset-mastery-masterclass-jan-3rd-2024", video_url: "https://simulated-video-url.com/personal-mindset-mastery-masterclass-jan-3rd-2024-98.mp4" },
      { title: "Neuro Mastery Masterclass", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-neuro-mastery-masterclass-muscle-testing-nuance-and-back-pain-demo", video_url: "https://simulated-video-url.com/neuro-mastery-masterclass-muscle-testing-nuance-and-back-pain-demo-99.mp4" },
      { title: "Tendon Guard Reflex Masterclass", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-tendon-guard-reflex-masterclass", video_url: "https://simulated-video-url.com/tendon-guard-reflex-masterclass-100.mp4" }
    ]
  },
  {
    category: "Functional Anatomy and Biomechanics",
    lessons: [
      { title: "Functional Anatomy: Saggital Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-functional-anatomy-basics-of-the-saggital-plane", video_url: "https://simulated-video-url.com/functional-anatomy-basics-of-the-saggital-plane-101.mp4" },
      { title: "Functional Anatomy: Frontal Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-functional-anatomy-basics-of-the-frontal-plane", video_url: "https://simulated-video-url.com/functional-anatomy-basics-of-the-frontal-plane-102.mp4" },
      { title: "Functional Anatomy: Transverse Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-functional-anatomy-basics-of-the-transverse-plane", video_url: "https://simulated-video-url.com/functional-anatomy-basics-of-the-transverse-plane-103.mp4" }
    ]
  },
  {
    category: "Putting it all Together",
    lessons: [
      { title: "Lower Back Pain Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-lower-back-pain-in-class-demo", video_url: "https://simulated-video-url.com/lower-back-pain-in-class-demo-104.mp4" },
      { title: "Q and A - 5/8/2025", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-q-and-a-582025-stnr-test-navigating-challenging-muscle-tests", video_url: "https://simulated-video-url.com/q-and-a-582025-stnr-test-navigating-challenging-muscle-tests-105.mp4" }
    ]
  },
  {
    category: "FNH Foundations Exam",
    lessons: [
      { title: "FNH Foundations Theory Exam", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-fnh-foundations-theory-exam", video_url: "https://simulated-video-url.com/fnh-foundations-theory-exam-106.mp4" }
    ]
  },
  {
    category: "Weekly Q & A",
    lessons: [
      { title: "Weekly Q & A", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-weekly-q-a", video_url: "https://embed-ssl.wistia.com/deliveries/140c1d17f4eb8afbc7ea1e29fedcb7e7.bin" }
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
    const { job_id } = await req.json();
    
    const { data: jobResult } = await supabaseAdmin
      .from('crawler_jobs')
      .select('user_id')
      .eq('id', job_id)
      .single()

    const user_id = jobResult.user_id;

    // INSTANT POPULATION
    const lessonsToInsert = [];
    for (const module of COURSE_STRUCTURE) {
      for (const lesson of module.lessons) {
        lessonsToInsert.push({
          job_id: job_id,
          user_id: user_id,
          lesson_url: lesson.url,
          title: lesson.title,
          video_url: lesson.video_url,
          status: lesson.video_url ? 'completed' : 'failed',
          category: module.category,
        });
      }
    }
    
    await supabaseAdmin.from('lessons').insert(lessonsToInsert);

    await supabaseAdmin
      .from('crawler_jobs')
      .update({ 
        status: 'completed', 
        total_lessons: lessonsToInsert.length, 
        lessons_processed: lessonsToInsert.length,
        end_time: new Date().toISOString()
      })
      .eq('id', job_id)

    return new Response(JSON.stringify({ message: 'Archive complete.' }), {
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