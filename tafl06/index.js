// Grammar
// const terminals = [';', 'a', '[', ']', '=', '+', '*', '(', ')', '-', '$'];
// const nonterminals = ['Z', 'S', 'O', 'E', 'T', 'P'];


const ACTION = new Array(28).fill(() => ({})), GOTO = new Array(28).fill(() => ({}));

ACTION[ 0]['a'] = 't3';
ACTION[ 1]['$'] = 'a';
ACTION[ 2][';'] = 't4';
ACTION[ 3]['['] = 't5';
ACTION[ 3]['='] = 't6';
ACTION[ 4]['a'] = 't3';
ACTION[ 4][']'] = 'r3';
ACTION[ 4]['$'] = 'r3';
ACTION[ 5]['a'] = 't3';
ACTION[ 6]['a'] = 't14';
ACTION[ 6]['('] = 't12';
ACTION[ 6]['-'] = 't13';
ACTION[ 7][']'] = 'r2';
ACTION[ 7]['$'] = 'r2';
ACTION[ 8][']'] = 't15';
ACTION[ 9][';'] = 'r6';
ACTION[ 9]['+'] = 't16';
ACTION[10][';'] = 'r8';
ACTION[10]['+'] = 'r8';
ACTION[10]['*'] = 't17';
ACTION[10][')'] = 'r8';
ACTION[11][';'] = 'r10';
ACTION[11]['+'] = 'r10';
ACTION[11]['*'] = 'r10';
ACTION[11][')'] = 'r10';
ACTION[12]['a'] = 't14';
ACTION[12]['('] = 't12';
ACTION[12]['-'] = 't13';
ACTION[13]['('] = 't19';
ACTION[14][';'] = 'r13';
ACTION[14]['+'] = 'r13';
ACTION[14]['*'] = 'r13';
ACTION[14][')'] = 'r13';
ACTION[15][';'] = 'r4';
ACTION[15]['['] = 't20';
ACTION[16]['a'] = 't14';
ACTION[16]['('] = 't12';
ACTION[16]['-'] = 't13';
ACTION[17]['a'] = 't14';
ACTION[17]['('] = 't12';
ACTION[17]['-'] = 't13';
ACTION[18]['+'] = 't16';
ACTION[18][')'] = 't23';
ACTION[19]['a'] = 't14';
ACTION[19]['('] = 't12';
ACTION[19]['-'] = 't13';
ACTION[20]['a'] = 't3';
ACTION[21][';'] = 'r7';
ACTION[21]['+'] = 'r7';
ACTION[21][')'] = 'r7';
ACTION[22][';'] = 'r9';
ACTION[22]['+'] = 'r9';
ACTION[22]['*'] = 'r9';
ACTION[22][')'] = 'r9';
ACTION[23][';'] = 'r11';
ACTION[23]['+'] = 'r11';
ACTION[23]['*'] = 'r11';
ACTION[23][')'] = 'r11';
ACTION[24]['+'] = 't16';
ACTION[24][')'] = 't26';
ACTION[25][']'] = 't27';
ACTION[26][';'] = 'r12';
ACTION[26]['+'] = 'r12';
ACTION[26]['*'] = 'r12';
ACTION[26][')'] = 'r12';
ACTION[27][';'] = 'r5';
GOTO[ 0]['S'] = 1;
GOTO[ 0]['O'] = 2;
GOTO[ 4]['S'] = 7;
GOTO[ 4]['O'] = 2;
GOTO[ 5]['S'] = 8;
GOTO[ 5]['O'] = 2;
GOTO[ 6]['E'] = 9;
GOTO[ 6]['T'] = 10;
GOTO[ 6]['P'] = 11;
GOTO[12]['E'] = 18;
GOTO[12]['T'] = 10;
GOTO[12]['P'] = 11;
GOTO[16]['T'] = 21;
GOTO[16]['P'] = 11;
GOTO[17]['P'] = 22;
GOTO[19]['E'] = 24;
GOTO[19]['T'] = 10;
GOTO[19]['P'] = 11;
GOTO[20]['S'] = 25;
GOTO[20]['O'] = 2;

// Z -> S
// S -> O;S
// S -> O;
// O -> a[S]
// O -> a[S][S]
// O -> a=E
// E -> E+T
// E -> T
// T -> T*P
// T -> P
// P -> (E)
// P -> -(E)
// P -> a
