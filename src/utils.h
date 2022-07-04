#define STRINGIFY_MACRO(x) STR(x)
#define STR(x) #x
#define EXPAND(x) x
#define CONCAT3(x,y,z) STRINGIFY_MACRO(EXPAND(x)EXPAND(y)EXPAND(z))
#define CAT(x,y,z) CAT_(x,y,z)
#define CAT_(x,y,z) x##y##z

#include <stdint.h>
#include <stdlib.h>

#include "randombytes.h"
