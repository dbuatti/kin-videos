"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, FileText } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const SYLLABUS_TEXT = `General / Intro
Resume Course 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474 🎥 Video: https://embed-ssl.wistia.com/deliveries/9p9s8iiisa.mp4

Course Introduction & Foundational Knowledge
Learning Materials 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167681807 🎥 Video: No Video ID found on page

About Your Instructor 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655462 🎥 Video: https://embed-ssl.wistia.com/deliveries/ynribqn4x1.mp4

Overview of the Approach 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655465 🎥 Video: https://embed-ssl.wistia.com/deliveries/lfxk9uzojg.mp4

Performance Iceberg 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167257485 🎥 Video: https://embed-ssl.wistia.com/deliveries/3tocvvu9v1.mp4

Neurophysiology 101 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655463 🎥 Video: https://embed-ssl.wistia.com/deliveries/2ikwbq0n13.mp4

3 Stages of Stress 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622397 🎥 Video: https://embed-ssl.wistia.com/deliveries/b4wa740tje.mp4

Threat Neurophysiology 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622399 🎥 Video: https://embed-ssl.wistia.com/deliveries/silwnqovd7.mp4

Autonomic Nervous System Overview 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167679824 🎥 Video: No Video ID found on page

Clinical Assessments
BOLT Test 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167251417 🎥 Video: https://embed-ssl.wistia.com/deliveries/ehor53pa9p.mp4

Breathing Assessment Quiz 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167619695 🎥 Video: No Video ID found on page

Lecture: Muscle Testing Fundamentals 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164865269 🎥 Video: https://embed-ssl.wistia.com/deliveries/rkfyj7cmd6.mp4

Muscle Testing Quiz 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2173091485 🎥 Video: No Video ID found on page

Demo: Indicator Muscle Fundamentals 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167415588 🎥 Video: https://embed-ssl.wistia.com/deliveries/fw2w0wa2os.mp4

Lecture: Therapy Localisation 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164866613 🎥 Video: https://embed-ssl.wistia.com/deliveries/k5puujsko6.mp4

Lecture: Intention Based Muscle Testing 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164893984 🎥 Video: https://embed-ssl.wistia.com/deliveries/ijykfrbitq.mp4

Direct Muscle Tests
Muscle Tests: Intrinsic Stabilisation System 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164756677 🎥 Video: https://embed-ssl.wistia.com/deliveries/q6p4ngo7j3.mp4

Muscle Tests: Transverse Abdominals 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164655470 🎥 Video: https://embed-ssl.wistia.com/deliveries/y0hsqrqf3i.mp4

Demo: TVA Muscle Test 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166239953 🎥 Video: https://embed-ssl.wistia.com/deliveries/h7v038nk76.mp4

Diaphragm 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833384 🎥 Video: https://embed-ssl.wistia.com/deliveries/fzbtbcjc6u.mp4

Pelvic Floor Muscle Tests 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647569 🎥 Video: https://embed-ssl.wistia.com/deliveries/dkoab9eenb.mp4

Multifidi 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167418078 🎥 Video: https://embed-ssl.wistia.com/deliveries/up90dzdxpa.mp4

Sacrospinalis 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833389 🎥 Video: https://embed-ssl.wistia.com/deliveries/c5p9fbtcgo.mp4

Demo: Quadriceps Group 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166288733 🎥 Video: https://embed-ssl.wistia.com/deliveries/sccerhmswf.mp4

Deltoids, Mid & Lower Traps, Pecs and Serratus Anterior 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647725 🎥 Video: https://embed-ssl.wistia.com/deliveries/ojxy4s4wi7.mp4

Biceps and Triceps 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167503394 🎥 Video: https://embed-ssl.wistia.com/deliveries/0ps5i05z37.mp4

Beginning Procedures - Sympathetic Down Regulation
Lecture: Beginning Procedure (Sympathetic Down Regulation) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164765571 🎥 Video: https://embed-ssl.wistia.com/deliveries/vqbbruguk9.mp4

Harmonic Rocking 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655471 🎥 Video: https://embed-ssl.wistia.com/deliveries/uxsgowfa1t.mp4

Lecture: T1 - Sympathetic Chain 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164763360 🎥 Video: https://embed-ssl.wistia.com/deliveries/t3j7gis6yj.mp4

T1 - Sympathetic Chain Demonstration 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655472 🎥 Video: https://embed-ssl.wistia.com/deliveries/6sbicveheu.mp4

Lecture: Phrenic Nerve 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164764506 🎥 Video: https://embed-ssl.wistia.com/deliveries/wj8ac0htji.mp4

In Class Demo: Phrenic Nerve 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2192994870 🎥 Video: https://embed-ssl.wistia.com/deliveries/9g5fehelaz.mp4

Phrenic Nerve Demonstration 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164663189 🎥 Video: https://embed-ssl.wistia.com/deliveries/2zbjbcpy9i.mp4

Lymphatic System Assessment and Correction
Lecture: Lymphatic System 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164764799 🎥 Video: https://embed-ssl.wistia.com/deliveries/ql8uazt89s.mp4

Lymphatic Cranial Reflex Zone 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2191285451 🎥 Video: https://embed-ssl.wistia.com/deliveries/90fd1dasvt.mp4

Lymphatic Release Positions 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164723635 🎥 Video: https://embed-ssl.wistia.com/deliveries/gkeq3cc4qv.mp4

Lymphatic System Full Procedure 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164719983 🎥 Video: https://embed-ssl.wistia.com/deliveries/1gf9mymw0k.mp4

Vagus Nerve
Vagus Nerve Masterclass 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865060 🎥 Video: https://embed-ssl.wistia.com/deliveries/p7sovcgeva.mp4

Lecture: Vagus Nerve Procedure 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865138 🎥 Video: https://embed-ssl.wistia.com/deliveries/qmknwe0gzr.mp4

Demonstration: Vagus Nerve Screen 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2166291753 🎥 Video: https://embed-ssl.wistia.com/deliveries/vnuzzo9m5n.mp4

Pathway Assessments and Corrections
Lecture: Pathway Assessment Process Overview 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164723262 🎥 Video: https://embed-ssl.wistia.com/deliveries/mxu99boq51.mp4

Lecture: Nociceptive Threat Assessment 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164728792 🎥 Video: https://embed-ssl.wistia.com/deliveries/grlcunou3s.mp4

Nociceptive Threat Assessment Demonstration 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164726137 🎥 Video: https://embed-ssl.wistia.com/deliveries/bnxl8yvoz6.mp4

Nociceptive Demo Review 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164772241 🎥 Video: https://embed-ssl.wistia.com/deliveries/xak39zdtrd.mp4

Lecture: Efferent Pathway Correction 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167444469 🎥 Video: https://embed-ssl.wistia.com/deliveries/7g1e7ke7fz.mp4

Lecture: Cortical Brain Zones 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167468893 🎥 Video: https://embed-ssl.wistia.com/deliveries/ootdt2sqt5.mp4

Lecture: Sub-Corticol Brain Zones 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167469166 🎥 Video: https://embed-ssl.wistia.com/deliveries/dpu0tfv6t3.mp4

Locating the Brain Reflex Areas 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2169356729 🎥 Video: https://embed-ssl.wistia.com/deliveries/g81sdf4g12.mp4

Lecture: Mechanoreceptor (Conscious) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171239933 🎥 Video: https://embed-ssl.wistia.com/deliveries/s80z640oe0.mp4

Demo: Mechanoreceptor (Conscious) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171201710 🎥 Video: https://embed-ssl.wistia.com/deliveries/ebe2dvptg2.mp4

Primitive Reflexes
Background Information for the Primitive Reflexes 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164792212 🎥 Video: No Video ID found on page

Lecture: Primitive Reflexes Overview 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164760586 🎥 Video: https://embed-ssl.wistia.com/deliveries/9hmm3ghuge.mp4

In Class Demo: Moro Reflex, Startle 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164728867 🎥 Video: https://embed-ssl.wistia.com/deliveries/9blpsd2r03.mp4

In Class Demo: Spinal Gallant Reflex 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2169016216 🎥 Video: https://embed-ssl.wistia.com/deliveries/au3ie182v1.mp4

ATNR Assessment Demo 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729690 🎥 Video: https://embed-ssl.wistia.com/deliveries/ghu33n9kj0.mp4

Tonic Labrynthine Reflex (TLR) Assessment Demo 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729000 🎥 Video: https://embed-ssl.wistia.com/deliveries/d4uvs2rutq.mp4

Fear Paralyis Reflex Demo 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167094242 🎥 Video: https://embed-ssl.wistia.com/deliveries/riloh8q5pb.mp4

Babinski Reflex Demo 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502394 🎥 Video: https://embed-ssl.wistia.com/deliveries/qln7pma0m2.mp4

Moro/Startle Reflex Demo 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502429 🎥 Video: https://embed-ssl.wistia.com/deliveries/tlegyln1lk.mp4

ATNR 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502432 🎥 Video: https://embed-ssl.wistia.com/deliveries/l1pvo6ipal.mp4

Postural Reflexes
Occular & Labrythine Righting Reflexes Assessment 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154822754/posts/2175437516 🎥 Video: https://embed-ssl.wistia.com/deliveries/eghzwenamd.mp4

Cranial Nerves
Lecture: Cranial Nerves 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2164792486 🎥 Video: https://embed-ssl.wistia.com/deliveries/plxv1d88us.mp4

Cranial Nerve I (Olfactory) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167205372 🎥 Video: https://embed-ssl.wistia.com/deliveries/7mu5tuh3pr.mp4

Cranial Nerve II (Optic Nerve) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779783 🎥 Video: https://embed-ssl.wistia.com/deliveries/xc447sz742.mp4

Cranial Nerve III (Oculomotor) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779787 🎥 Video: https://embed-ssl.wistia.com/deliveries/c64smaaz7c.mp4

Cranial Nerve IV (Trochlear) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779806 🎥 Video: https://embed-ssl.wistia.com/deliveries/zaiigboej3.mp4

Cranial Nerve V (Trigeminal) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780073 🎥 Video: https://embed-ssl.wistia.com/deliveries/1qeat2j7ld.mp4

Cranial Nerve VI (Abducens) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780077 🎥 Video: https://embed-ssl.wistia.com/deliveries/mfey36i185.mp4

Cranial Nerve VII (Facial) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780903 🎥 Video: https://embed-ssl.wistia.com/deliveries/ys2s3mz2fu.mp4

Cranial Nerve VIII (Vestibulo-cochlear) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780911 🎥 Video: https://embed-ssl.wistia.com/deliveries/v52ffb0y1z.mp4

Cranial Nerve IX (Glossopharyngeal) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780916 🎥 Video: https://embed-ssl.wistia.com/deliveries/brkh4p054u.mp4

Emotional Corrections
Lecture: Emotional Corrections 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2165230137 🎥 Video: https://embed-ssl.wistia.com/deliveries/iwg08t0k7n.mp4

In class Lecture and Demo: Emotions 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2172678455 🎥 Video: https://embed-ssl.wistia.com/deliveries/f1l8gym4ac.mp4

Demo: Emotional Correction 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2164720410 🎥 Video: https://embed-ssl.wistia.com/deliveries/wxcumt6yel.mp4

Finishing Procedures and Home Reinforcement
Lecture: Gaits Integration 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655473 🎥 Video: https://embed-ssl.wistia.com/deliveries/95jayidy1b.mp4

Gaits Integration Procedure 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164757718 🎥 Video: https://embed-ssl.wistia.com/deliveries/d3kn26q09f.mp4

In class Lecture: Gaits 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2172690792 🎥 Video: https://embed-ssl.wistia.com/deliveries/ova2orz4v3.mp4

Things to Check during the session and for Home Reinforcement 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474 🎥 Video: https://embed-ssl.wistia.com/deliveries/9p9s8iiisa.mp4

Background Information
Lecture: How the Brain Maps Movement 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2164853086 🎥 Video: https://embed-ssl.wistia.com/deliveries/iyenik446l.mp4

Chronic Pain and the Brain 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2165118302 🎥 Video: https://embed-ssl.wistia.com/deliveries/1h4psr6ax8.mp4

Masterclasses
Vertigo Masterclass - 21/Nov/2023 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2172969132 🎥 Video: https://embed-ssl.wistia.com/deliveries/nh01u1v7g1.mp4

Personal Mindset Mastery Masterclass (Jan 3rd, 2024) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2174007926 🎥 Video: https://embed-ssl.wistia.com/deliveries/ukinxx5n2f.mp4

Neuro Mastery Masterclass: Muscle Testing Nuance and Back Pain Demo 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2187544782 🎥 Video: https://embed-ssl.wistia.com/deliveries/tj2sgsbddp.mp4

Tendon Guard Reflex Masterclass 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2187887358 🎥 Video: https://embed-ssl.wistia.com/deliveries/ce1ziulvtm.mp4

Functional Anatomy and Biomechanics
Functional Anatomy Basics of the Saggital Plane 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369485 🎥 Video: https://embed-ssl.wistia.com/deliveries/83mr423tlx.mp4

Functional Anatomy Basics of the Frontal Plane 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369489 🎥 Video: https://embed-ssl.wistia.com/deliveries/9uyt0t2vh7.mp4

Functional Anatomy basics of the Transverse Plane 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369492 🎥 Video: https://embed-ssl.wistia.com/deliveries/jedwjs7ex0.mp4

Putting it all Together
Lower Back Pain (In Class Demo) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2176704641 🎥 Video: https://embed-ssl.wistia.com/deliveries/b8o5ts25yz.mp4

Q and A - 5/8/2025 (STNR test, Navigating Challenging Muscle Tests) 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2187520560 🎥 Video: https://embed-ssl.wistia.com/deliveries/enc2m9jkst.mp4

FNH Foundations Exam
FNH Foundations Theory Exam 🔗 Page: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2156390136/posts/2182274096 🎥 Video: No Video ID found on page`;

const SyllabusClipboard = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText(SYLLABUS_TEXT);
    showSuccess("Full syllabus copied to clipboard!");
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="bg-primary/20 p-3 rounded-2xl shadow-lg border border-primary/20">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Master Syllabus</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-md">
              Copy the complete course structure including all verified page and video links for your records or AI assistants.
            </p>
          </div>
        </div>
        <Button 
          onClick={handleCopy}
          className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 py-6 h-auto font-bold shadow-lg transition-all transform hover:scale-105 shrink-0"
        >
          <Copy className="w-5 h-5 mr-2" />
          Copy to Clipboard
        </Button>
      </div>
    </div>
  );
};

export default SyllabusClipboard;