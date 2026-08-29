import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  Ellipse, Rect, Circle, Path, Line, Polygon, Text as SvgText, G
} from 'react-native-svg';
import { IllustrationKey } from '../data';
import { Language } from '../i18n/LanguageContext';

// Collar color maps to level
const collarColors: Record<IllustrationKey, string> = {
  sit: '#FF6B35', come: '#FF6B35', down: '#FF6B35',
  crate_enter: '#2EC4B6', crate_return: '#2EC4B6', crate_full: '#2EC4B6',
  leave_close: '#9B5DE5', leave_back: '#9B5DE5', leave_walk: '#9B5DE5',
  walk_pull: '#06D6A0', walk_sit: '#06D6A0', walk_stay: '#06D6A0',
  trick_paw: '#E8A317', trick_high5: '#E8A317', trick_spin: '#E8A317',
};

const bubbleTexts: Record<Language, Record<IllustrationKey, string>> = {
  he: {
    sit: 'שב!', come: 'אליי!', down: 'ארצה!',
    crate_enter: 'מקום!', crate_return: 'אליי! מקום!', crate_full: 'מקום!',
    leave_close: 'עזוב!', leave_back: 'עזוב!', leave_walk: 'עזוב!',
    walk_pull: 'לידי!', walk_sit: 'שב!', walk_stay: 'הישאר!',
    trick_paw: 'תן כף!', trick_high5: 'גבוה!', trick_spin: 'הסתובב!',
  },
  en: {
    sit: 'Sit!', come: 'Come!', down: 'Down!',
    crate_enter: 'Place!', crate_return: 'Come! Place!', crate_full: 'Place!',
    leave_close: 'Leave it!', leave_back: 'Leave it!', leave_walk: 'Leave it!',
    walk_pull: 'Heel!', walk_sit: 'Sit!', walk_stay: 'Stay!',
    trick_paw: 'Paw!', trick_high5: 'High five!', trick_spin: 'Spin!',
  },
};

const stepsLabel: Record<Language, string> = { he: '3 צעדים', en: '3 steps' };
const wellDoneLabel: Record<Language, string> = { he: 'כל הכבוד!', en: 'Well done!' };
const waitLabel: Record<Language, string> = { he: 'רגע...', en: 'Wait...' };

// Leash color, shared by all walk_* poses
const LEASH_COLOR = '#8B6340';

function DogSit({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      <Ellipse cx="100" cy="198" rx="36" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="88" cy="182" rx="23" ry="19" fill="#D4A055" />
      <Ellipse cx="113" cy="182" rx="19" ry="17" fill="#C89040" />
      <Rect x="77" y="162" width="12" height="34" rx="6" fill="#D4A055" />
      <Rect x="93" y="162" width="12" height="34" rx="6" fill="#C89040" />
      <Ellipse cx="83" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="99" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="98" cy="156" rx="27" ry="21" fill="#D4A055" />
      <Ellipse cx="98" cy="136" rx="16" ry="12" fill="#D4A055" />
      <Rect x="83" y="142" width="29" height="7" rx="3" fill={col} />
      <Circle cx="98" cy="146" r="3" fill="#FFD166" />
      <Ellipse cx="98" cy="115" rx="23" ry="21" fill="#D4A055" />
      <Ellipse cx="91" cy="111" rx="12" ry="9" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="78" cy="121" rx="9" ry="16" fill="#C08030" rotation="-14" originX="78" originY="121" />
      <Ellipse cx="118" cy="121" rx="9" ry="16" fill="#C08030" rotation="14" originX="118" originY="121" />
      <Ellipse cx="98" cy="128" rx="12" ry="9" fill="#C89040" />
      <Ellipse cx="98" cy="124" rx="9" ry="6" fill="#DCAA5A" />
      <Ellipse cx="98" cy="120" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="88" cy="112" r="5" fill="#2C1810" />
      <Circle cx="109" cy="112" r="5" fill="#2C1810" />
      <Circle cx="86.5" cy="110.5" r="1.8" fill="white" />
      <Circle cx="107.5" cy="110.5" r="1.8" fill="white" />
      <Path d="M91 131 Q98 138 105 131" stroke="#A06828" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="98" cy="133" rx="4" ry="3" fill="#D4608A" opacity="0.85" />
      {/* Tail */}
      <G rotation={wag} originX="122" originY="160">
        <Path d="M122 160 Q141 141 146 126" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M122 160 Q141 141 146 126" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogCome({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      <Ellipse cx="100" cy="198" rx="36" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="106" cy="168" rx="28" ry="14" fill="#D4A055" rotation="-12" originX="106" originY="168" />
      <Rect x="80" y="170" width="11" height="24" rx="5" fill="#D4A055" rotation="-25" originX="84" originY="170" />
      <Rect x="96" y="173" width="11" height="22" rx="5" fill="#C89040" rotation="12" originX="100" originY="173" />
      <Rect x="114" y="170" width="11" height="22" rx="5" fill="#D4A055" rotation="22" originX="118" originY="170" />
      <Rect x="128" y="168" width="11" height="22" rx="5" fill="#C08030" rotation="-8" originX="132" originY="168" />
      <Ellipse cx="74" cy="196" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="104" cy="198" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="128" cy="196" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="86" cy="155" rx="14" ry="10" fill="#D4A055" />
      <Rect x="74" y="158" width="24" height="6" rx="3" fill={col} />
      <Circle cx="86" cy="161" r="2.5" fill="#FFD166" />
      <Ellipse cx="72" cy="142" rx="21" ry="19" fill="#D4A055" />
      <Ellipse cx="65" cy="138" rx="11" ry="8" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="56" cy="143" rx="8" ry="13" fill="#C08030" rotation="28" originX="56" originY="143" />
      <Ellipse cx="88" cy="139" rx="8" ry="12" fill="#C08030" rotation="-12" originX="88" originY="139" />
      <Ellipse cx="54" cy="150" rx="11" ry="8" fill="#C89040" />
      <Ellipse cx="51" cy="147" rx="6" ry="5" fill="#DCAA5A" />
      <Ellipse cx="51" cy="145" rx="5" ry="3.5" fill="#2C1810" />
      <Circle cx="64" cy="136" r="5" fill="#2C1810" />
      <Circle cx="79" cy="135" r="5" fill="#2C1810" />
      <Circle cx="62.5" cy="134.5" r="1.8" fill="white" />
      <Circle cx="77.5" cy="133.5" r="1.8" fill="white" />
      <Path d="M47 152 Q51 161 49 166 Q53 171 57 166 Q55 161 59 152" fill="#D4608A" />
      <G rotation={wag} originX="132" originY="163">
        <Path d="M132 163 Q150 141 154 122" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M132 163 Q150 141 154 122" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogDown({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      <Ellipse cx="100" cy="198" rx="48" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="104" cy="188" rx="44" ry="12" fill="#D4A055" />
      <Ellipse cx="100" cy="183" rx="31" ry="8" fill="#EEC070" opacity="0.5" />
      <Rect x="64" y="184" width="30" height="9" rx="4" fill="#C08030" />
      <Rect x="128" y="184" width="28" height="9" rx="4" fill="#C08030" />
      <Ellipse cx="64" cy="194" rx="9" ry="4" fill="#B07030" />
      <Ellipse cx="150" cy="194" rx="9" ry="4" fill="#B07030" />
      <Ellipse cx="78" cy="178" rx="13" ry="9" fill="#D4A055" />
      <Rect x="67" y="181" width="22" height="6" rx="3" fill={col} />
      <Circle cx="78" cy="184" r="2.5" fill="#FFD166" />
      <Ellipse cx="65" cy="168" rx="20" ry="17" fill="#D4A055" />
      <Ellipse cx="59" cy="164" rx="10" ry="7" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="49" cy="173" rx="8" ry="13" fill="#C08030" rotation="14" originX="49" originY="173" />
      <Ellipse cx="81" cy="167" rx="8" ry="12" fill="#C08030" rotation="-6" originX="81" originY="167" />
      <Ellipse cx="47" cy="178" rx="11" ry="7" fill="#C89040" />
      <Ellipse cx="44" cy="176" rx="6" ry="4" fill="#DCAA5A" />
      <Ellipse cx="44" cy="174" rx="5" ry="3" fill="#2C1810" />
      <Path d="M57 162 Q62 158 67 162" stroke="#2C1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Path d="M71 161 Q76 157 81 161" stroke="#2C1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <G rotation={wag} originX="144" originY="190">
        <Path d="M144 190 Q160 183 168 174" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M144 190 Q160 183 168 174" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function CrateAndDog({ open, col, wag }: { open: boolean; col: string; wag: number }) {
  return (
    <G>
      {/* Crate */}
      <Rect x="20" y="138" width="88" height="12" rx="4" fill="#8B6340" />
      <Rect x="20" y="96" width="88" height="44" rx="3" fill="#A0754A" opacity="0.3" />
      <Rect x="20" y="92" width="88" height="8" rx="4" fill="#8B6340" />
      <Rect x="20" y="96" width="8" height="44" rx="3" fill="#8B6340" />
      <Rect x="100" y="96" width="8" height="44" rx="3" fill="#6B4C2A" />
      {open ? (
        <G>
          <Rect x="92" y="96" width="5" height="44" rx="2" fill="#6B4C2A" opacity="0.5" />
          <Rect x="86" y="94" width="5" height="48" rx="2" fill="#6B4C2A" opacity="0.5" />
        </G>
      ) : (
        <G>
          <Rect x="36" y="96" width="5" height="44" rx="2" fill="#6B4C2A" />
          <Rect x="47" y="96" width="5" height="44" rx="2" fill="#6B4C2A" />
          <Rect x="58" y="96" width="5" height="44" rx="2" fill="#6B4C2A" />
          <Rect x="69" y="96" width="5" height="44" rx="2" fill="#6B4C2A" />
          <Rect x="80" y="96" width="5" height="44" rx="2" fill="#6B4C2A" />
          <Circle cx="64" cy="120" r="4" fill="#C8A060" />
        </G>
      )}
      <Ellipse cx="64" cy="146" rx="28" ry="4" fill="#C8956C" opacity="0.4" />
      {/* Dog inside */}
      <Ellipse cx="62" cy="144" rx="30" ry="7" fill="#D4A055" opacity="0.9" />
      <Ellipse cx="62" cy="138" rx="22" ry="6" fill="#EEC070" opacity="0.5" />
      <Rect x="38" y="135" width="18" height="8" rx="4" fill="#C08030" />
      <Ellipse cx="38" cy="143" rx="7" ry="3.5" fill="#B07030" />
      <Rect x="48" y="130" width="18" height="6" rx="3" fill={col} />
      <Circle cx="57" cy="133" r="2" fill="#FFD166" />
      <Ellipse cx="44" cy="124" rx="16" ry="13" fill="#D4A055" />
      <Ellipse cx="38" cy="120" rx="8" ry="6" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="29" cy="126" rx="7" ry="11" fill="#C08030" rotation="12" originX="29" originY="126" />
      <Ellipse cx="58" cy="124" rx="7" ry="10" fill="#C08030" rotation="-8" originX="58" originY="124" />
      <Ellipse cx="31" cy="130" rx="9" ry="6" fill="#C89040" />
      <Ellipse cx="28" cy="128" rx="5" ry="4" fill="#DCAA5A" />
      <Ellipse cx="28" cy="126" rx="4" ry="3" fill="#2C1810" />
      <Circle cx="38" cy="119" r="4" fill="#2C1810" />
      <Circle cx="51" cy="118" r="4" fill="#2C1810" />
      <Circle cx="36.5" cy="117.5" r="1.4" fill="white" />
      <Circle cx="49.5" cy="116.5" r="1.4" fill="white" />
      <G rotation={wag} originX="88" originY="141">
        <Path d="M88 141 Q102 128 105 115" stroke="#B87830" strokeWidth="9" fill="none" strokeLinecap="round" />
        <Path d="M88 141 Q102 128 105 115" stroke="#D4A055" strokeWidth="5" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogLeaveClose({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      {/* Bone */}
      <Rect x="148" y="192" width="18" height="5" rx="2" fill="#E8C080" />
      <Circle cx="148" cy="194" r="4" fill="#E8C080" />
      <Circle cx="166" cy="194" r="4" fill="#E8C080" />
      <Ellipse cx="157" cy="200" rx="12" ry="5" fill="#8B6340" opacity="0.4" />
      {/* Dog */}
      <Ellipse cx="92" cy="198" rx="34" ry="5" fill="#90B860" opacity="0.4" />
      <Ellipse cx="80" cy="181" rx="22" ry="18" fill="#D4A055" />
      <Ellipse cx="104" cy="181" rx="18" ry="16" fill="#C89040" />
      <Rect x="70" y="162" width="12" height="33" rx="6" fill="#D4A055" />
      <Rect x="86" y="162" width="12" height="33" rx="6" fill="#C89040" />
      <Ellipse cx="76" cy="196" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="92" cy="196" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="90" cy="156" rx="26" ry="20" fill="#D4A055" />
      <Ellipse cx="90" cy="136" rx="15" ry="11" fill="#D4A055" />
      <Rect x="76" y="142" width="28" height="7" rx="3" fill={col} />
      <Circle cx="90" cy="146" r="3" fill="#FFD166" />
      <Ellipse cx="102" cy="113" rx="22" ry="20" fill="#D4A055" />
      <Ellipse cx="109" cy="108" rx="12" ry="9" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="82" cy="118" rx="9" ry="15" fill="#C08030" rotation="-14" originX="82" originY="118" />
      <Ellipse cx="122" cy="116" rx="9" ry="14" fill="#C08030" rotation="18" originX="122" originY="116" />
      <Ellipse cx="114" cy="125" rx="13" ry="9" fill="#C89040" />
      <Ellipse cx="116" cy="121" rx="9" ry="6" fill="#DCAA5A" />
      <Ellipse cx="117" cy="117" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="96" cy="108" r="5" fill="#2C1810" />
      <Circle cx="111" cy="107" r="5" fill="#2C1810" />
      <Circle cx="98" cy="109" r="2" fill="white" />
      <Circle cx="113" cy="108" r="2" fill="white" />
      <Path d="M118 130 Q119 137 118 142" stroke="#A0C8F0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      <Circle cx="118" cy="144" r="3" fill="#A0C8F0" opacity="0.7" />
      <Path d="M152 192 Q138 174 120 128" stroke="#9B5DE5" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.5" />
      <G rotation={wag} originX="113" originY="158">
        <Path d="M113 158 Q122 174 120 183" stroke="#B87830" strokeWidth="9" fill="none" strokeLinecap="round" />
        <Path d="M113 158 Q122 174 120 183" stroke="#D4A055" strokeWidth="5" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogLeaveBack({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      <Rect x="148" y="192" width="18" height="5" rx="2" fill="#E8C080" />
      <Circle cx="148" cy="194" r="4" fill="#E8C080" />
      <Circle cx="166" cy="194" r="4" fill="#E8C080" />
      <Ellipse cx="88" cy="198" rx="33" ry="5" fill="#90B860" opacity="0.4" />
      <Ellipse cx="77" cy="181" rx="22" ry="18" fill="#D4A055" />
      <Ellipse cx="101" cy="181" rx="18" ry="16" fill="#C89040" />
      <Rect x="67" y="162" width="12" height="33" rx="6" fill="#D4A055" />
      <Rect x="83" y="162" width="12" height="33" rx="6" fill="#C89040" />
      <Ellipse cx="73" cy="196" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="89" cy="196" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="87" cy="156" rx="25" ry="20" fill="#D4A055" />
      <Ellipse cx="87" cy="136" rx="15" ry="11" fill="#D4A055" />
      <Rect x="73" y="142" width="28" height="7" rx="3" fill={col} />
      <Circle cx="87" cy="146" r="3" fill="#FFD166" />
      <Ellipse cx="87" cy="113" rx="22" ry="20" fill="#D4A055" />
      <Ellipse cx="80" cy="109" rx="12" ry="9" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="67" cy="119" rx="9" ry="15" fill="#C08030" rotation="-14" originX="67" originY="119" />
      <Ellipse cx="107" cy="119" rx="9" ry="15" fill="#C08030" rotation="14" originX="107" originY="119" />
      <Ellipse cx="87" cy="125" rx="12" ry="9" fill="#C89040" />
      <Ellipse cx="87" cy="121" rx="9" ry="6" fill="#DCAA5A" />
      <Ellipse cx="87" cy="117" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="77" cy="109" r="5" fill="#2C1810" />
      <Circle cx="98" cy="109" r="5" fill="#2C1810" />
      <Circle cx="75.5" cy="107.5" r="1.8" fill="white" />
      <Circle cx="96.5" cy="107.5" r="1.8" fill="white" />
      <Path d="M80 129 Q87 135 94 129" stroke="#A06828" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="87" cy="131" rx="4" ry="3" fill="#D4608A" opacity="0.7" />
      <SvgText x="87" y="90" textAnchor="middle" fontSize="18" fill="#06D6A0" fontWeight="800">V</SvgText>
      <G rotation={wag} originX="109" originY="160">
        <Path d="M109 160 Q128 141 132 126" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M109 160 Q128 141 132 126" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogLeaveWalk({ col, wag, language }: { col: string; wag: number; language: Language }) {
  return (
    <G>
      <Rect x="128" y="192" width="18" height="5" rx="2" fill="#E8C080" />
      <Circle cx="128" cy="194" r="4" fill="#E8C080" />
      <Circle cx="146" cy="194" r="4" fill="#E8C080" />
      <Line x1="112" y1="172" x2="210" y2="172" stroke="#9B5DE5" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.4" />
      <SvgText x="160" y="167" textAnchor="middle" fontSize="10" fill="#9B5DE5" fontWeight="700" opacity="0.8">{stepsLabel[language]}</SvgText>
      <Ellipse cx="74" cy="198" rx="32" ry="5" fill="#90B860" opacity="0.4" />
      <Ellipse cx="63" cy="181" rx="21" ry="17" fill="#D4A055" />
      <Ellipse cx="86" cy="181" rx="17" ry="15" fill="#C89040" />
      <Rect x="54" y="163" width="11" height="32" rx="5" fill="#D4A055" />
      <Rect x="69" y="163" width="11" height="32" rx="5" fill="#C89040" />
      <Ellipse cx="60" cy="196" rx="7" ry="4" fill="#B87830" />
      <Ellipse cx="74" cy="196" rx="7" ry="4" fill="#B87830" />
      <Ellipse cx="72" cy="156" rx="24" ry="19" fill="#D4A055" />
      <Ellipse cx="72" cy="137" rx="14" ry="11" fill="#D4A055" />
      <Rect x="59" y="143" width="26" height="6" rx="3" fill={col} />
      <Circle cx="72" cy="146" r="2.5" fill="#FFD166" />
      <Ellipse cx="72" cy="114" rx="21" ry="19" fill="#D4A055" />
      <Ellipse cx="66" cy="110" rx="11" ry="8" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="53" cy="119" rx="8" ry="14" fill="#C08030" rotation="-14" originX="53" originY="119" />
      <Ellipse cx="91" cy="119" rx="8" ry="14" fill="#C08030" rotation="14" originX="91" originY="119" />
      <Ellipse cx="72" cy="125" rx="11" ry="8" fill="#C89040" />
      <Ellipse cx="72" cy="121" rx="8" ry="6" fill="#DCAA5A" />
      <Ellipse cx="72" cy="117" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="62" cy="109" r="5" fill="#2C1810" />
      <Circle cx="82" cy="109" r="5" fill="#2C1810" />
      <Circle cx="60.5" cy="107.5" r="1.8" fill="white" />
      <Circle cx="80.5" cy="107.5" r="1.8" fill="white" />
      <Path d="M65 128 Q72 135 79 128" stroke="#A06828" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="72" cy="130" rx="4" ry="3" fill="#D4608A" opacity="0.85" />
      <SvgText x="72" y="88" fontSize="15" fill="#FFD166" textAnchor="middle">&#11088;</SvgText>
      <SvgText x="72" y="75" fontSize="10" fill="#9B5DE5" textAnchor="middle" fontWeight="800">{wellDoneLabel[language]}</SvgText>
      <G rotation={wag} originX="93" originY="158">
        <Path d="M93 158 Q110 139 114 124" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M93 158 Q110 139 114 124" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogWalkPull({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      {/* Taut leash - drawn first so the dog sits on top of it */}
      <Line x1="90" y1="158" x2="200" y2="112" stroke={LEASH_COLOR} strokeWidth="2.5" strokeLinecap="round" />
      <Ellipse cx="100" cy="198" rx="36" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="106" cy="168" rx="28" ry="14" fill="#D4A055" rotation="-12" originX="106" originY="168" />
      <Rect x="80" y="170" width="11" height="24" rx="5" fill="#D4A055" rotation="-25" originX="84" originY="170" />
      <Rect x="96" y="173" width="11" height="22" rx="5" fill="#C89040" rotation="12" originX="100" originY="173" />
      <Rect x="114" y="170" width="11" height="22" rx="5" fill="#D4A055" rotation="22" originX="118" originY="170" />
      <Rect x="128" y="168" width="11" height="22" rx="5" fill="#C08030" rotation="-8" originX="132" originY="168" />
      <Ellipse cx="74" cy="196" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="104" cy="198" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="128" cy="196" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="86" cy="155" rx="14" ry="10" fill="#D4A055" />
      <Rect x="74" y="158" width="24" height="6" rx="3" fill={col} />
      <Circle cx="86" cy="161" r="2.5" fill="#FFD166" />
      <Ellipse cx="72" cy="142" rx="21" ry="19" fill="#D4A055" />
      <Ellipse cx="65" cy="138" rx="11" ry="8" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="56" cy="143" rx="8" ry="13" fill="#C08030" rotation="28" originX="56" originY="143" />
      <Ellipse cx="88" cy="139" rx="8" ry="12" fill="#C08030" rotation="-12" originX="88" originY="139" />
      <Ellipse cx="54" cy="150" rx="11" ry="8" fill="#C89040" />
      <Ellipse cx="51" cy="147" rx="6" ry="5" fill="#DCAA5A" />
      <Ellipse cx="51" cy="145" rx="5" ry="3.5" fill="#2C1810" />
      <Circle cx="64" cy="136" r="5" fill="#2C1810" />
      <Circle cx="79" cy="135" r="5" fill="#2C1810" />
      <Circle cx="62.5" cy="134.5" r="1.8" fill="white" />
      <Circle cx="77.5" cy="133.5" r="1.8" fill="white" />
      <Path d="M47 152 Q51 161 49 166 Q53 171 57 166 Q55 161 59 152" fill="#D4608A" />
      <G rotation={wag} originX="132" originY="163">
        <Path d="M132 163 Q150 141 154 122" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M132 163 Q150 141 154 122" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
      {/* "Turn around" cue */}
      <Path d="M258 188 Q274 176 258 164" stroke={col} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Polygon points="253,167 262,162 262,173" fill={col} />
    </G>
  );
}

function DogWalkSit({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      <Path d="M112 148 Q160 186 200 125" stroke={LEASH_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="100" cy="198" rx="36" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="88" cy="182" rx="23" ry="19" fill="#D4A055" />
      <Ellipse cx="113" cy="182" rx="19" ry="17" fill="#C89040" />
      <Rect x="77" y="162" width="12" height="34" rx="6" fill="#D4A055" />
      <Rect x="93" y="162" width="12" height="34" rx="6" fill="#C89040" />
      <Ellipse cx="83" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="99" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="98" cy="156" rx="27" ry="21" fill="#D4A055" />
      <Ellipse cx="98" cy="136" rx="16" ry="12" fill="#D4A055" />
      <Rect x="83" y="142" width="29" height="7" rx="3" fill={col} />
      <Circle cx="98" cy="146" r="3" fill="#FFD166" />
      <Ellipse cx="98" cy="115" rx="23" ry="21" fill="#D4A055" />
      <Ellipse cx="91" cy="111" rx="12" ry="9" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="78" cy="121" rx="9" ry="16" fill="#C08030" rotation="-14" originX="78" originY="121" />
      <Ellipse cx="118" cy="121" rx="9" ry="16" fill="#C08030" rotation="14" originX="118" originY="121" />
      <Ellipse cx="98" cy="128" rx="12" ry="9" fill="#C89040" />
      <Ellipse cx="98" cy="124" rx="9" ry="6" fill="#DCAA5A" />
      <Ellipse cx="98" cy="120" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="88" cy="112" r="5" fill="#2C1810" />
      <Circle cx="109" cy="112" r="5" fill="#2C1810" />
      <Circle cx="86.5" cy="110.5" r="1.8" fill="white" />
      <Circle cx="107.5" cy="110.5" r="1.8" fill="white" />
      <Path d="M91 131 Q98 138 105 131" stroke="#A06828" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="98" cy="133" rx="4" ry="3" fill="#D4608A" opacity="0.85" />
      <G rotation={wag} originX="122" originY="160">
        <Path d="M122 160 Q141 141 146 126" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M122 160 Q141 141 146 126" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogWalkStay({ col, wag, language }: { col: string; wag: number; language: Language }) {
  return (
    <G>
      <Line x1="115" y1="176" x2="205" y2="176" stroke={col} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.4" />
      <SvgText x="160" y="171" textAnchor="middle" fontSize="10" fill={col} fontWeight="700" opacity="0.8">{waitLabel[language]}</SvgText>
      <Path d="M112 148 Q160 186 200 125" stroke={LEASH_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="100" cy="198" rx="36" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="88" cy="182" rx="23" ry="19" fill="#D4A055" />
      <Ellipse cx="113" cy="182" rx="19" ry="17" fill="#C89040" />
      <Rect x="77" y="162" width="12" height="34" rx="6" fill="#D4A055" />
      <Rect x="93" y="162" width="12" height="34" rx="6" fill="#C89040" />
      <Ellipse cx="83" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="99" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="98" cy="156" rx="27" ry="21" fill="#D4A055" />
      <Ellipse cx="98" cy="136" rx="16" ry="12" fill="#D4A055" />
      <Rect x="83" y="142" width="29" height="7" rx="3" fill={col} />
      <Circle cx="98" cy="146" r="3" fill="#FFD166" />
      <Ellipse cx="98" cy="115" rx="23" ry="21" fill="#D4A055" />
      <Ellipse cx="91" cy="111" rx="12" ry="9" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="78" cy="121" rx="9" ry="16" fill="#C08030" rotation="-14" originX="78" originY="121" />
      <Ellipse cx="118" cy="121" rx="9" ry="16" fill="#C08030" rotation="14" originX="118" originY="121" />
      <Ellipse cx="98" cy="128" rx="12" ry="9" fill="#C89040" />
      <Ellipse cx="98" cy="124" rx="9" ry="6" fill="#DCAA5A" />
      <Ellipse cx="98" cy="120" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="88" cy="112" r="5" fill="#2C1810" />
      <Circle cx="109" cy="112" r="5" fill="#2C1810" />
      <Circle cx="86.5" cy="110.5" r="1.8" fill="white" />
      <Circle cx="107.5" cy="110.5" r="1.8" fill="white" />
      <Path d="M91 131 Q98 138 105 131" stroke="#A06828" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="98" cy="133" rx="4" ry="3" fill="#D4608A" opacity="0.85" />
      <G rotation={wag} originX="122" originY="160">
        <Path d="M122 160 Q141 141 146 126" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M122 160 Q141 141 146 126" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogTrickPaw({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      <Ellipse cx="100" cy="198" rx="36" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="88" cy="182" rx="23" ry="19" fill="#D4A055" />
      <Ellipse cx="113" cy="182" rx="19" ry="17" fill="#C89040" />
      <Rect x="93" y="162" width="12" height="34" rx="6" fill="#C89040" />
      <Ellipse cx="99" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="98" cy="156" rx="27" ry="21" fill="#D4A055" />
      <Ellipse cx="98" cy="136" rx="16" ry="12" fill="#D4A055" />
      <Rect x="83" y="142" width="29" height="7" rx="3" fill={col} />
      <Circle cx="98" cy="146" r="3" fill="#FFD166" />
      <Ellipse cx="98" cy="115" rx="23" ry="21" fill="#D4A055" />
      <Ellipse cx="91" cy="111" rx="12" ry="9" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="78" cy="121" rx="9" ry="16" fill="#C08030" rotation="-14" originX="78" originY="121" />
      <Ellipse cx="118" cy="121" rx="9" ry="16" fill="#C08030" rotation="14" originX="118" originY="121" />
      <Ellipse cx="98" cy="128" rx="12" ry="9" fill="#C89040" />
      <Ellipse cx="98" cy="124" rx="9" ry="6" fill="#DCAA5A" />
      <Ellipse cx="98" cy="120" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="88" cy="112" r="5" fill="#2C1810" />
      <Circle cx="109" cy="112" r="5" fill="#2C1810" />
      <Circle cx="86.5" cy="110.5" r="1.8" fill="white" />
      <Circle cx="107.5" cy="110.5" r="1.8" fill="white" />
      <Path d="M91 131 Q98 138 105 131" stroke="#A06828" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="98" cy="133" rx="4" ry="3" fill="#D4608A" opacity="0.85" />
      {/* Raised paw, offered toward the human */}
      <Rect x="100" y="168" width="11" height="26" rx="5" fill="#D4A055" rotation="-55" originX="100" originY="180" />
      <Ellipse cx="123" cy="163" rx="8" ry="5" fill="#B87830" rotation="-30" originX="123" originY="163" />
      <G rotation={wag} originX="122" originY="160">
        <Path d="M122 160 Q141 141 146 126" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M122 160 Q141 141 146 126" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogTrickHigh5({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      <Ellipse cx="100" cy="198" rx="36" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="88" cy="182" rx="23" ry="19" fill="#D4A055" />
      <Ellipse cx="113" cy="182" rx="19" ry="17" fill="#C89040" />
      <Rect x="93" y="162" width="12" height="34" rx="6" fill="#C89040" />
      <Ellipse cx="99" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="98" cy="156" rx="27" ry="21" fill="#D4A055" />
      <Ellipse cx="98" cy="136" rx="16" ry="12" fill="#D4A055" />
      <Rect x="83" y="142" width="29" height="7" rx="3" fill={col} />
      <Circle cx="98" cy="146" r="3" fill="#FFD166" />
      <Ellipse cx="98" cy="115" rx="23" ry="21" fill="#D4A055" />
      <Ellipse cx="91" cy="111" rx="12" ry="9" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="78" cy="121" rx="9" ry="16" fill="#C08030" rotation="-14" originX="78" originY="121" />
      <Ellipse cx="118" cy="121" rx="9" ry="16" fill="#C08030" rotation="14" originX="118" originY="121" />
      <Ellipse cx="98" cy="128" rx="12" ry="9" fill="#C89040" />
      <Ellipse cx="98" cy="124" rx="9" ry="6" fill="#DCAA5A" />
      <Ellipse cx="98" cy="120" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="88" cy="112" r="5" fill="#2C1810" />
      <Circle cx="109" cy="112" r="5" fill="#2C1810" />
      <Circle cx="86.5" cy="110.5" r="1.8" fill="white" />
      <Circle cx="107.5" cy="110.5" r="1.8" fill="white" />
      <Path d="M91 131 Q98 138 105 131" stroke="#A06828" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="98" cy="133" rx="4" ry="3" fill="#D4608A" opacity="0.85" />
      {/* Paw raised high to meet the human's hand */}
      <Rect x="103" y="128" width="11" height="34" rx="5" fill="#D4A055" rotation="-72" originX="103" originY="160" />
      <Ellipse cx="132" cy="120" rx="8" ry="5" fill="#B87830" rotation="-15" originX="132" originY="120" />
      <SvgText x="140" y="112" fontSize="14" textAnchor="middle">&#10024;</SvgText>
      <G rotation={wag} originX="122" originY="160">
        <Path d="M122 160 Q141 141 146 126" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M122 160 Q141 141 146 126" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function DogTrickSpin({ col, wag }: { col: string; wag: number }) {
  return (
    <G>
      {/* Motion swirl around the dog */}
      <Path d="M56 152 A48 44 0 1 1 142 152" stroke={col} strokeWidth="2.5" strokeDasharray="5 4" fill="none" opacity="0.5" />
      <Polygon points="136,146 147,150 139,159" fill={col} opacity="0.7" />
      <Ellipse cx="100" cy="198" rx="36" ry="6" fill="#90B860" opacity="0.4" />
      <Ellipse cx="88" cy="182" rx="23" ry="19" fill="#D4A055" />
      <Ellipse cx="113" cy="182" rx="19" ry="17" fill="#C89040" />
      <Rect x="77" y="162" width="12" height="34" rx="6" fill="#D4A055" />
      <Rect x="93" y="162" width="12" height="34" rx="6" fill="#C89040" />
      <Ellipse cx="83" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="99" cy="197" rx="8" ry="4" fill="#B87830" />
      <Ellipse cx="98" cy="156" rx="27" ry="21" fill="#D4A055" />
      <Ellipse cx="98" cy="136" rx="16" ry="12" fill="#D4A055" />
      <Rect x="83" y="142" width="29" height="7" rx="3" fill={col} />
      <Circle cx="98" cy="146" r="3" fill="#FFD166" />
      <Ellipse cx="98" cy="115" rx="23" ry="21" fill="#D4A055" />
      <Ellipse cx="91" cy="111" rx="12" ry="9" fill="#EEC070" opacity="0.5" />
      <Ellipse cx="78" cy="121" rx="9" ry="16" fill="#C08030" rotation="-14" originX="78" originY="121" />
      <Ellipse cx="118" cy="121" rx="9" ry="16" fill="#C08030" rotation="14" originX="118" originY="121" />
      <Ellipse cx="98" cy="128" rx="12" ry="9" fill="#C89040" />
      <Ellipse cx="98" cy="124" rx="9" ry="6" fill="#DCAA5A" />
      <Ellipse cx="98" cy="120" rx="6" ry="4" fill="#2C1810" />
      <Circle cx="88" cy="112" r="5" fill="#2C1810" />
      <Circle cx="109" cy="112" r="5" fill="#2C1810" />
      <Circle cx="86.5" cy="110.5" r="1.8" fill="white" />
      <Circle cx="107.5" cy="110.5" r="1.8" fill="white" />
      <Path d="M91 131 Q98 138 105 131" stroke="#A06828" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Ellipse cx="98" cy="133" rx="4" ry="3" fill="#D4608A" opacity="0.85" />
      <G rotation={wag} originX="122" originY="160">
        <Path d="M122 160 Q141 141 146 126" stroke="#B87830" strokeWidth="10" fill="none" strokeLinecap="round" />
        <Path d="M122 160 Q141 141 146 126" stroke="#D4A055" strokeWidth="6" fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}

function Human({ pose }: { pose: string }) {
  const isBack = pose === 'leave_back' || pose === 'walk_pull';
  return (
    <G>
      <Ellipse cx="245" cy="200" rx="20" ry="5" fill="#90B860" opacity="0.35" />
      <Rect x="235" y="150" width="10" height="48" rx="5" fill="#3A3A5C" />
      <Rect x="248" y="150" width="10" height="48" rx="5" fill="#2E2E4A" />
      <Ellipse cx="240" cy="199" rx="8" ry="4" fill="#1A1A2E" />
      <Ellipse cx="253" cy="199" rx="8" ry="4" fill="#1A1A2E" />
      <Rect x="231" y="103" width="31" height="51" rx="9" fill={isBack ? '#E85A24' : '#FF6B35'} />
      <Rect x="231" y="103" width="31" height="12" rx="9" fill={isBack ? '#D04E1A' : '#E85A24'} />
      {(pose === 'sit' || pose === 'trick_spin') && (
        <G>
          <Rect x="220" y="108" width="16" height="8" rx="4" fill="#E8956A" rotation="55" originX="231" originY="112" />
          <Circle cx="212" cy="136" r="6" fill="#E8956A" />
          <Rect x="209" y="129" width="7" height="6" rx="2" fill="#FFD166" />
        </G>
      )}
      {pose === 'trick_paw' && (
        <G>
          <Rect x="205" y="140" width="26" height="8" rx="4" fill="#E8956A" rotation="35" originX="231" originY="144" />
          <Circle cx="203" cy="152" r="6" fill="#E8956A" />
        </G>
      )}
      {pose === 'trick_high5' && (
        <G>
          <Rect x="209" y="116" width="26" height="8" rx="4" fill="#E8956A" rotation="18" originX="231" originY="120" />
          <Circle cx="206" cy="124" r="6" fill="#E8956A" />
        </G>
      )}
      {pose === 'come' && (
        <G>
          <Rect x="215" y="110" width="18" height="8" rx="4" fill="#E8956A" rotation="30" originX="231" originY="114" />
          <Circle cx="215" cy="126" r="6" fill="#E8956A" />
        </G>
      )}
      {pose === 'down' && (
        <G>
          <Rect x="218" y="112" width="16" height="8" rx="4" fill="#E8956A" rotation="70" originX="231" originY="116" />
          <Circle cx="211" cy="144" r="6" fill="#E8956A" />
          <Rect x="208" y="137" width="7" height="6" rx="2" fill="#FFD166" />
        </G>
      )}
      {(pose === 'crate_enter') && (
        <G>
          <Rect x="207" y="114" width="28" height="8" rx="4" fill="#E8956A" rotation="15" originX="231" originY="118" />
          <Circle cx="205" cy="128" r="6" fill="#E8956A" />
        </G>
      )}
      {(pose === 'crate_return' || pose === 'crate_full') && (
        <G>
          <Rect x="218" y="112" width="16" height="8" rx="4" fill="#E8956A" rotation="60" originX="231" originY="116" />
          <Circle cx="212" cy="143" r="6" fill="#E8956A" />
          <Rect x="209" y="136" width="7" height="6" rx="2" fill="#FFD166" />
        </G>
      )}
      {(pose === 'leave_close' || pose === 'leave_walk') && (
        <G>
          <Rect x="203" y="112" width="26" height="8" rx="4" fill="#E8956A" rotation="-5" originX="231" originY="116" />
          <Rect x="194" y="104" width="12" height="16" rx="5" fill="#E8956A" />
          <Rect x="192" y="102" width="5" height="12" rx="2.5" fill="#E8956A" />
          <Rect x="197" y="100" width="5" height="12" rx="2.5" fill="#E8956A" />
          <Rect x="202" y="101" width="5" height="12" rx="2.5" fill="#E8956A" />
          <Rect x="207" y="103" width="5" height="11" rx="2.5" fill="#E8956A" />
        </G>
      )}
      {(pose === 'leave_back' || pose === 'walk_pull') && (
        <G>
          <Rect x="262" y="110" width="20" height="8" rx="4" fill="#D07050" rotation="10" originX="262" originY="114" />
          <Circle cx="282" cy="118" r="6" fill="#D07050" />
        </G>
      )}
      {pose === 'walk_pull' && (
        <G>
          <Rect x="200" y="108" width="30" height="8" rx="4" fill="#D07050" rotation="-6" originX="230" originY="112" />
          <Circle cx="198" cy="112" r="6" fill="#D07050" />
        </G>
      )}
      {pose === 'walk_sit' && (
        <G>
          <Rect x="205" y="112" width="26" height="8" rx="4" fill="#E8956A" rotation="15" originX="231" originY="116" />
          <Circle cx="203" cy="120" r="6" fill="#E8956A" />
        </G>
      )}
      {pose === 'walk_stay' && (
        <G>
          <Rect x="215" y="72" width="12" height="34" rx="5" fill="#E8956A" rotation="-25" originX="231" originY="103" />
          <Circle cx="211" cy="70" r="7" fill="#E8956A" />
        </G>
      )}
      {pose !== 'leave_back' && pose !== 'walk_pull' && (
        <Rect x="262" y="110" width="13" height="8" rx="4" fill="#E8956A" rotation="-18" originX="262" originY="114" />
      )}
      <Rect x="241" y="92" width="11" height="14" rx="5" fill="#E8956A" />
      <Ellipse cx="246" cy="81" rx="19" ry="20" fill="#E8956A" />
      <Ellipse cx="246" cy="64" rx="18" ry="10" fill="#2C1810" />
      <Rect x="228" y="64" width="9" height="15" rx="4" fill="#2C1810" />
      <Rect x="255" y="64" width="9" height="15" rx="4" fill="#2C1810" />
      <Path d="M230 67 Q238 59 246 66 Q254 59 262 67" fill="#2C1810" />
      {!isBack && (
        <G>
          <Circle cx="239" cy="79" r="3.5" fill="#2C1810" />
          <Circle cx="252" cy="79" r="3.5" fill="#2C1810" />
          <Circle cx="240.5" cy="77.5" r="1.2" fill="white" />
          <Circle cx="253.5" cy="77.5" r="1.2" fill="white" />
          <Path d="M236 73 Q239 70 242 73" stroke="#2C1810" strokeWidth="1.5" fill="none" />
          <Path d="M249 73 Q252 70 255 73" stroke="#2C1810" strokeWidth="1.5" fill="none" />
          <Path d="M238 87 Q246 93 253 87" stroke="#C07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </G>
      )}
    </G>
  );
}

interface DogSceneProps {
  illustration: IllustrationKey;
  language: Language;
  size?: number;
}

export default function DogScene({ illustration, language, size = 300 }: DogSceneProps) {
  const col = collarColors[illustration] || '#FF6B35';
  const bubbleText = bubbleTexts[language][illustration] || '';
  const isCrateScene = illustration === 'crate_enter' || illustration === 'crate_return' || illustration === 'crate_full';
  const isOpen = illustration === 'crate_enter' || illustration === 'crate_full';

  const bubbleWidth = illustration === 'crate_return' ? 88 : 70;
  const bubbleCx = 265 + bubbleWidth / 2;
  const fontSize = illustration === 'crate_return' ? 11 : 14;

  const bob = useRef(new Animated.Value(0)).current;
  const tailPhase = useRef(new Animated.Value(0)).current;
  const [tailAngle, setTailAngle] = useState(-10);

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailPhase, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(tailPhase, { toValue: 0, duration: 260, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    const listenerId = tailPhase.addListener(({ value }) => setTailAngle(-10 + value * 20));
    bobLoop.start();
    tailLoop.start();
    return () => { bobLoop.stop(); tailLoop.stop(); tailPhase.removeListener(listenerId); };
  }, []);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const scale = bob.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
      <Svg width={size} height={size * 0.66} viewBox="0 0 320 210">
        <Ellipse cx="160" cy="204" rx="145" ry="8" fill="#D4E8B0" opacity="0.6" />
        <Line x1="15" y1="204" x2="305" y2="204" stroke="#A8CC78" strokeWidth="1.5" />
        {isCrateScene && <CrateAndDog open={isOpen} col={col} wag={tailAngle} />}
        <Human pose={illustration} />
        {/* Bubble */}
        <Rect x="265" y="36" width={bubbleWidth} height="32" rx="13" fill="white" stroke="#6B5CE7" strokeWidth="1.5" />
        <Polygon points={`271,68 277,81 287,68`} fill="white" stroke="#6B5CE7" strokeWidth="1.5" />
        <Polygon points={`272,67 287,67 278,80`} fill="white" />
        <SvgText x={bubbleCx} y="57" textAnchor="middle" fontFamily="Heebo" fontSize={fontSize} fontWeight="800" fill="#6B5CE7">
          {bubbleText}
        </SvgText>
        {!isCrateScene && (
          <G>
            {illustration === 'sit' && <DogSit col={col} wag={tailAngle} />}
            {illustration === 'come' && <DogCome col={col} wag={tailAngle} />}
            {illustration === 'down' && <DogDown col={col} wag={tailAngle} />}
            {illustration === 'leave_close' && <DogLeaveClose col={col} wag={tailAngle} />}
            {illustration === 'leave_back' && <DogLeaveBack col={col} wag={tailAngle} />}
            {illustration === 'leave_walk' && <DogLeaveWalk col={col} wag={tailAngle} language={language} />}
            {illustration === 'walk_pull' && <DogWalkPull col={col} wag={tailAngle} />}
            {illustration === 'walk_sit' && <DogWalkSit col={col} wag={tailAngle} />}
            {illustration === 'walk_stay' && <DogWalkStay col={col} wag={tailAngle} language={language} />}
            {illustration === 'trick_paw' && <DogTrickPaw col={col} wag={tailAngle} />}
            {illustration === 'trick_high5' && <DogTrickHigh5 col={col} wag={tailAngle} />}
            {illustration === 'trick_spin' && <DogTrickSpin col={col} wag={tailAngle} />}
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}
