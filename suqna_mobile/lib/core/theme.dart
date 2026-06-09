import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Suqna brand palette (light theme — mirrors the web app).
class Brand {
  static const ember = Color(0xFFE8621A);
  static const emberDark = Color(0xFFC44E0A);
  static const emberLight = Color(0xFFF4884A);
  static const gold = Color(0xFFD4A843);
  static const bg = Color(0xFFFAF7F2); // warm off-white page
  static const surface = Color(0xFFFFFFFF);
  static const ink = Color(0xFF1C1714); // primary text
  static const muted = Color(0xFF6B5D4D); // secondary text
  static const faint = Color(0xFF9A8A76); // tertiary
  static const line = Color(0xFFE7E0D5); // borders
  static const night = Color(0xFF0D0A06); // dark accent (logo bg etc.)
}

ThemeData buildTheme() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: Brand.bg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Brand.ember,
      primary: Brand.ember,
      brightness: Brightness.light,
    ).copyWith(surface: Brand.surface),
  );

  final text = GoogleFonts.outfitTextTheme(base.textTheme).apply(
    bodyColor: Brand.ink,
    displayColor: Brand.ink,
  );

  return base.copyWith(
    textTheme: text.copyWith(
      headlineLarge: GoogleFonts.cormorantGaramond(
          textStyle: text.headlineLarge, fontWeight: FontWeight.w600, color: Brand.ink),
      headlineMedium: GoogleFonts.cormorantGaramond(
          textStyle: text.headlineMedium, fontWeight: FontWeight.w600, color: Brand.ink),
      titleLarge: GoogleFonts.outfit(textStyle: text.titleLarge, fontWeight: FontWeight.w700),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: Brand.surface,
      foregroundColor: Brand.ink,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: GoogleFonts.outfit(
          color: Brand.ink, fontSize: 18, fontWeight: FontWeight.w700),
    ),
    cardTheme: CardThemeData(
      color: Brand.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Brand.line),
      ),
      margin: EdgeInsets.zero,
    ),
    dividerTheme: const DividerThemeData(color: Brand.line, thickness: 1, space: 1),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Brand.surface,
      hintStyle: const TextStyle(color: Brand.faint),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Brand.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Brand.ember, width: 1.6),
      ),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: Brand.ember,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
        textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Brand.ink,
        side: const BorderSide(color: Brand.line),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
        textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 15),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: Brand.ember),
    ),
    chipTheme: base.chipTheme.copyWith(
      backgroundColor: Brand.bg,
      side: const BorderSide(color: Brand.line),
      labelStyle: const TextStyle(color: Brand.muted, fontSize: 12),
    ),
    snackBarTheme: const SnackBarThemeData(behavior: SnackBarBehavior.floating),
  );
}

/// Suqna wordmark — "Suq" ink + "na" ember, in the display serif.
class SuqnaWordmark extends StatelessWidget {
  final double size;
  final Color? inkColor;
  const SuqnaWordmark({super.key, this.size = 26, this.inkColor});

  @override
  Widget build(BuildContext context) {
    final style = GoogleFonts.cormorantGaramond(
      fontSize: size,
      fontWeight: FontWeight.w700,
      height: 1,
      color: inkColor ?? Brand.ink,
    );
    return RichText(
      text: TextSpan(style: style, children: const [
        TextSpan(text: 'Suq'),
        TextSpan(text: 'na', style: TextStyle(color: Brand.ember)),
      ]),
    );
  }
}
