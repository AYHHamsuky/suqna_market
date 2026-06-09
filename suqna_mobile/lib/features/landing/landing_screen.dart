import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/config.dart';
import '../../core/theme.dart';
import '../auth/session.dart';

/// Marketing / welcome screen shown to guests before sign-in — mirrors the web landing.
class LandingScreen extends ConsumerWidget {
  const LandingScreen({super.key});

  static const _items = [
    'Gullisuwa',
    'Tuwan Madara',
    'Suya',
    'Fresh Wara',
    'Kunu & Zobo',
    'Fura da Nono',
    'Ankara',
    'Phone Repairs',
    'Henna',
    'Tailoring',
  ];

  static const _cats = [
    ('🍖', 'Street Food & Drinks', 'Suya, Kilishi, Burgers…'),
    ('🥬', 'Fresh Produce', 'Tomatoes, Onions, Greens…'),
    ('🥛', 'Dairy & Animal', 'Nono, Wara, Eggs…'),
    ('🧵', 'Clothing & Fabric', 'Ankara, Lace, Aso-oke…'),
    ('🔧', 'Repairs & Trades', 'Electronics, Welding…'),
    ('✂️', 'Personal Services', 'Barbering, Henna…'),
    ('🏠', 'Household & Supplies', 'Cleaning, Décor…'),
    ('📚', 'Education & Skills', 'Tutorials, Lessons…'),
  ];

  static const _how = [
    (
      '01',
      'Search in your language',
      'Type in Hausa or English. "Tuwan madara", "swallows", "tuwo" — all lead to the same vendors.'
    ),
    (
      '02',
      'See every vendor on the map',
      'Matching vendors appear as pins. Distance, price and rating at a glance.'
    ),
    (
      '03',
      'Order, chat or pick up',
      'Place an order, message the vendor, or just get directions. Pay securely in-app.'
    ),
  ];

  static const _features = [
    (
      Icons.map_outlined,
      'Live vendor map',
      'Every vendor is a pin — distance, direction and navigation in one tap.'
    ),
    (
      Icons.balance_outlined,
      'Price comparison',
      'Every vendor selling the same item, side by side. Cheapest, nearest or highest rated.'
    ),
    (
      Icons.translate_outlined,
      'Hausa & English search',
      'Built around the way Nigerians actually speak.'
    ),
    (
      Icons.verified_user_outlined,
      'Secure payments',
      'Pay via Paystack with buyer protection until you confirm delivery.'
    ),
  ];

  static const _stats = [
    ('500+', 'Vendors'),
    ('12k+', 'Products'),
    ('4.8★', 'Rating'),
    ('2 min', 'Avg. response'),
  ];

  Future<void> _serverDialog(BuildContext context, WidgetRef ref) async {
    final ctrl =
        TextEditingController(text: ref.read(sessionProvider).baseUrl);
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Server settings'),
        content: StatefulBuilder(
          builder: (context, setLocal) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Point the app at your Suqna backend.',
                    style:
                        TextStyle(color: Brand.muted, fontSize: 13)),
                const SizedBox(height: 12),
                TextField(
                    controller: ctrl,
                    decoration: const InputDecoration(
                        hintText: 'http://host:8000/api/v1')),
                const SizedBox(height: 10),
                Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final e in AppConfig.presets.entries)
                        ActionChip(
                            label: Text(e.key,
                                style: const TextStyle(fontSize: 11)),
                            onPressed: () =>
                                setLocal(() => ctrl.text = e.value)),
                    ]),
              ]),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Save')),
        ],
      ),
    );
    if (saved == true) {
      await ref
          .read(sessionProvider.notifier)
          .setBaseUrl(ctrl.text.trim());
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Server address saved')));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF7F2),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          // ── Hero ──────────────────────────────────────────────────────────
          _Hero(onServer: () => _serverDialog(context, ref)),

          // ── Scrolling marquee strip ───────────────────────────────────────
          _MarqueeStrip(items: _items),

          // ── Trust stats bar ───────────────────────────────────────────────
          _StatsBar(stats: _stats),

          // ── How it works ──────────────────────────────────────────────────
          _SectionBlock(
            tag: 'How it works',
            headline: 'Simple as walking\nto the market',
            child: Column(
              children: [
                for (final (n, title, text) in _how)
                  _HowStep(n: n, title: title, text: text),
              ],
            ),
          ),

          // ── Categories ────────────────────────────────────────────────────
          _SectionBlock(
            tag: 'Browse categories',
            headline: 'Every item,\nevery vendor',
            child: LayoutBuilder(builder: (context, c) {
              const gap = 12.0;
              final w = (c.maxWidth - gap) / 2;
              return Wrap(
                spacing: gap,
                runSpacing: gap,
                children: [
                  for (final (emoji, name, sub) in _cats)
                    SizedBox(
                        width: w,
                        child: _CatCard(emoji: emoji, name: name, sub: sub)),
                ],
              );
            }),
          ),

          // ── Features ──────────────────────────────────────────────────────
          _SectionBlock(
            tag: 'Why Suqna',
            headline: 'Built for how\nNigeria really shops',
            hasBackground: true,
            child: Column(
              children: [
                for (final (icon, title, text) in _features)
                  _FeatureRow(icon: icon, title: title, text: text),
              ],
            ),
          ),

          // ── Testimonial pull-quote ─────────────────────────────────────────
          _TestimonialBlock(),

          // ── Bottom CTA ────────────────────────────────────────────────────
          _BottomCta(),

          // ── Footer ────────────────────────────────────────────────────────
          _Footer(),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

class _Hero extends StatelessWidget {
  final VoidCallback onServer;
  const _Hero({required this.onServer});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFBF3F0A), Color(0xFFD9541E), Color(0xFFE8722A)],
        ),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Background decorative circles
          Positioned(
            right: -80,
            top: -80,
            child: _DecorCircle(size: 280, opacity: 0.07),
          ),
          Positioned(
            left: -40,
            bottom: 20,
            child: _DecorCircle(size: 180, opacity: 0.05),
          ),
          // Geometric sunburst
          Positioned(
            right: -30,
            top: 40,
            child: Opacity(
              opacity: 0.06,
              child: Transform.rotate(
                angle: math.pi / 8,
                child: const Icon(Icons.wb_sunny_outlined,
                    size: 220, color: Colors.white),
              ),
            ),
          ),
          // Dot-grid texture patch
          Positioned(
            left: 0,
            bottom: 0,
            right: 0,
            child: SizedBox(
              height: 60,
              child: CustomPaint(painter: _DotGridPainter()),
            ),
          ),

          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 10, 10, 44),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Nav row
                  Row(children: [
                    const SuqnaWordmark(size: 28, inkColor: Colors.white),
                    const Spacer(),
                    _GlassChip(label: 'Kaduna Live', icon: Icons.circle,
                        iconColor: const Color(0xFF7BF589)),
                    const SizedBox(width: 4),
                    IconButton(
                      tooltip: 'Server settings',
                      onPressed: onServer,
                      icon: const Icon(Icons.dns_outlined,
                          color: Colors.white70, size: 20),
                    ),
                  ]),

                  const SizedBox(height: 36),

                  // Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.28)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFF7BF589),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 7),
                        const Text('Now live · Expanding to more cities',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.3)),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // Headline
                  RichText(
                    text: TextSpan(
                      style: GoogleFonts.cormorantGaramond(
                          fontSize: 52,
                          height: 1.0,
                          color: Colors.white,
                          fontWeight: FontWeight.w300),
                      children: [
                        const TextSpan(text: 'Your market\nis '),
                        TextSpan(
                            text: 'right here,',
                            style: TextStyle(
                                color: const Color(0xFFFFD580),
                                fontStyle: FontStyle.italic,
                                fontWeight: FontWeight.w600)),
                        const TextSpan(text: '\nright now.'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  Text(
                    'Find, compare and buy from local vendors\nnear you — in any language, for any item.',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.82),
                        fontSize: 14.5,
                        height: 1.6,
                        letterSpacing: 0.1),
                  ),

                  const SizedBox(height: 28),

                  // CTA buttons
                  Row(children: [
                    Expanded(
                      child: _HeroButton(
                        label: 'Get started',
                        isPrimary: true,
                        onTap: () => context.go('/register'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _HeroButton(
                        label: 'Sign in',
                        isPrimary: false,
                        onTap: () => context.go('/login'),
                      ),
                    ),
                  ]),

                  const SizedBox(height: 20),

                  // Social proof mini-row
                  Row(
                    children: [
                      _AvatarStack(),
                      const SizedBox(width: 10),
                      Text(
                        '2,400+ buyers this week',
                        style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.75),
                            fontSize: 12,
                            fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GlassChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color iconColor;
  const _GlassChip(
      {required this.label, required this.icon, required this.iconColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 7, color: iconColor),
        const SizedBox(width: 5),
        Text(label,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w500)),
      ]),
    );
  }
}

class _HeroButton extends StatelessWidget {
  final String label;
  final bool isPrimary;
  final VoidCallback onTap;
  const _HeroButton(
      {required this.label,
      required this.isPrimary,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    if (isPrimary) {
      return ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFFBF3F0A),
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(
              fontWeight: FontWeight.w700, fontSize: 14, letterSpacing: 0.2),
        ),
        child: Text(label),
      );
    }
    return OutlinedButton(
      onPressed: onTap,
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 14),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.5)),
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(
            fontWeight: FontWeight.w600, fontSize: 14, letterSpacing: 0.2),
      ),
      child: Text(label),
    );
  }
}

class _AvatarStack extends StatelessWidget {
  static const _colors = [
    Color(0xFFFFB347),
    Color(0xFFFF7043),
    Color(0xFF42A5F5),
    Color(0xFF66BB6A),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 74,
      height: 28,
      child: Stack(
        children: [
          for (int i = 0; i < 4; i++)
            Positioned(
              left: i * 18.0,
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: _colors[i],
                  shape: BoxShape.circle,
                  border:
                      Border.all(color: const Color(0xFFD9541E), width: 2),
                ),
                child: Center(
                  child: Text(
                    String.fromCharCode(0x1F600 + i),
                    style: const TextStyle(fontSize: 12),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _DecorCircle extends StatelessWidget {
  final double size;
  final double opacity;
  const _DecorCircle({required this.size, required this.opacity});

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: opacity,
      child: Container(
        width: size,
        height: size,
        decoration: const BoxDecoration(
            color: Colors.white, shape: BoxShape.circle),
      ),
    );
  }
}

class _DotGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.12)
      ..style = PaintingStyle.fill;
    const spacing = 14.0;
    const radius = 1.2;
    for (double x = spacing; x < size.width; x += spacing) {
      for (double y = spacing; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Marquee strip
// ─────────────────────────────────────────────────────────────────────────────

class _MarqueeStrip extends StatelessWidget {
  final List<String> items;
  const _MarqueeStrip({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF1A0E06),
      padding: const EdgeInsets.symmetric(vertical: 11),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            for (final it in [...items, ...items]) ...[
              Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                    color: Color(0xFFE8722A), shape: BoxShape.circle),
              ),
              const SizedBox(width: 10),
              Text(
                it,
                style: GoogleFonts.cormorantGaramond(
                    color: const Color(0xFFF5DEB3),
                    fontSize: 17,
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.3),
              ),
              const SizedBox(width: 18),
            ],
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats bar
// ─────────────────────────────────────────────────────────────────────────────

class _StatsBar extends StatelessWidget {
  final List<(String, String)> stats;
  const _StatsBar({required this.stats});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF5EDE2),
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          for (int i = 0; i < stats.length; i++) ...[
            _StatItem(value: stats[i].$1, label: stats[i].$2),
            if (i < stats.length - 1)
              Container(
                  width: 1, height: 32, color: const Color(0xFFDDD0C4)),
          ],
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value, label;
  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.cormorantGaramond(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: const Color(0xFFBF3F0A)),
        ),
        Text(label,
            style: const TextStyle(
                fontSize: 10,
                color: Color(0xFF8A7060),
                fontWeight: FontWeight.w500,
                letterSpacing: 0.4)),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────

class _SectionBlock extends StatelessWidget {
  final String tag, headline;
  final Widget child;
  final bool hasBackground;

  const _SectionBlock({
    required this.tag,
    required this.headline,
    required this.child,
    this.hasBackground = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: hasBackground ? const Color(0xFFF5EDE2) : const Color(0xFFFBF7F2),
      padding: const EdgeInsets.fromLTRB(20, 36, 20, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTag(tag),
          const SizedBox(height: 6),
          Text(
            headline,
            style: GoogleFonts.cormorantGaramond(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1A0E06),
                height: 1.08,
                letterSpacing: -0.3),
          ),
          const SizedBox(height: 20),
          child,
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section tag
// ─────────────────────────────────────────────────────────────────────────────

class _SectionTag extends StatelessWidget {
  final String label;
  const _SectionTag(this.label);

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 22,
        height: 2.5,
        decoration: BoxDecoration(
          color: const Color(0xFFD9541E),
          borderRadius: BorderRadius.circular(2),
        ),
      ),
      const SizedBox(width: 9),
      Text(
        label.toUpperCase(),
        style: const TextStyle(
            color: Color(0xFFD9541E),
            fontSize: 10.5,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.6),
      ),
    ]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// How-it-works step
// ─────────────────────────────────────────────────────────────────────────────

class _HowStep extends StatelessWidget {
  final String n, title, text;
  const _HowStep(
      {required this.n, required this.title, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Number badge
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: const Color(0xFFBF3F0A).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: const Color(0xFFBF3F0A).withValues(alpha: 0.18)),
          ),
          child: Center(
            child: Text(
              n,
              style: GoogleFonts.cormorantGaramond(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFFBF3F0A)),
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: Color(0xFF1A0E06),
                        letterSpacing: -0.1)),
                const SizedBox(height: 4),
                Text(text,
                    style: const TextStyle(
                        color: Color(0xFF7A6355),
                        fontSize: 13.5,
                        height: 1.55)),
              ]),
        ),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Category card
// ─────────────────────────────────────────────────────────────────────────────

class _CatCard extends StatelessWidget {
  final String emoji, name, sub;
  const _CatCard(
      {required this.emoji, required this.name, required this.sub});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFEDE0D4)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFBF3F0A).withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: const Color(0xFFFBF0E6),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
              child: Text(emoji,
                  style: const TextStyle(fontSize: 24))),
        ),
        const SizedBox(height: 10),
        Text(name,
            style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: Color(0xFF1A0E06))),
        const SizedBox(height: 2),
        Text(sub,
            style: const TextStyle(
                fontSize: 11,
                color: Color(0xFF9A8070),
                height: 1.4)),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature row
// ─────────────────────────────────────────────────────────────────────────────

class _FeatureRow extends StatelessWidget {
  final IconData icon;
  final String title, text;
  const _FeatureRow(
      {required this.icon, required this.title, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFD9541E), Color(0xFFBF3F0A)],
            ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFBF3F0A).withValues(alpha: 0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 22),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: Color(0xFF1A0E06),
                        letterSpacing: -0.1)),
                const SizedBox(height: 4),
                Text(text,
                    style: const TextStyle(
                        color: Color(0xFF7A6355),
                        fontSize: 13.5,
                        height: 1.55)),
              ]),
        ),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Testimonial
// ─────────────────────────────────────────────────────────────────────────────

class _TestimonialBlock extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF1A0E06),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '"',
            style: GoogleFonts.cormorantGaramond(
                fontSize: 80,
                height: 0.6,
                color: const Color(0xFFD9541E),
                fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 14),
          Text(
            'I found a suya vendor two streets away I never knew existed. Ordered, paid and picked up in 10 minutes.',
            style: GoogleFonts.cormorantGaramond(
                fontSize: 22,
                color: const Color(0xFFF5DEB3),
                height: 1.4,
                fontWeight: FontWeight.w500,
                fontStyle: FontStyle.italic),
          ),
          const SizedBox(height: 20),
          Row(children: [
            Container(
              width: 38,
              height: 38,
              decoration: const BoxDecoration(
                  color: Color(0xFFD9541E), shape: BoxShape.circle),
              child: const Center(
                  child: Text('🙋', style: TextStyle(fontSize: 18))),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Hauwa Musa',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 13)),
                const Text('Kaduna North, Buyer',
                    style: TextStyle(
                        color: Color(0xFF9A8070),
                        fontSize: 11,
                        letterSpacing: 0.2)),
              ],
            ),
            const Spacer(),
            Row(children: [
              for (int i = 0; i < 5; i++)
                const Icon(Icons.star_rounded,
                    color: Color(0xFFFFD580), size: 14),
            ]),
          ]),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom CTA
// ─────────────────────────────────────────────────────────────────────────────

class _BottomCta extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          margin: const EdgeInsets.fromLTRB(16, 24, 16, 0),
          padding: const EdgeInsets.fromLTRB(24, 36, 24, 32),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFBF3F0A), Color(0xFFE8722A)],
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFBF3F0A).withValues(alpha: 0.4),
                blurRadius: 30,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                right: -20,
                top: -20,
                child: Opacity(
                  opacity: 0.08,
                  child: const Icon(Icons.storefront_outlined,
                      size: 150, color: Colors.white),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'The market you know,\nfinally in your pocket.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.cormorantGaramond(
                        color: Colors.white,
                        fontSize: 30,
                        fontWeight: FontWeight.w700,
                        height: 1.1),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Join thousands of buyers and vendors already on Suqna.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.75),
                        fontSize: 13,
                        height: 1.5),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFFBF3F0A),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      textStyle: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                          letterSpacing: 0.1),
                    ),
                    onPressed: () => context.go('/register'),
                    child: const Text('Create a free account'),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    style: TextButton.styleFrom(
                        foregroundColor: Colors.white,
                        textStyle: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14)),
                    child: const Text('I already have an account'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────

class _Footer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF1A0E06),
      padding: const EdgeInsets.fromLTRB(22, 28, 22, 36),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SuqnaWordmark(size: 24, inkColor: Colors.white),
                    const SizedBox(height: 8),
                    Text(
                      'Making local commerce\naccessible for everyone.',
                      style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                          fontSize: 12,
                          height: 1.6),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 20),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _FooterLink('About', '/about'),
                  _FooterLink('For vendors', '/vendor'),
                  _FooterLink('Help', '/help'),
                  _FooterLink('Privacy', '/privacy'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          Divider(color: Colors.white.withValues(alpha: 0.08)),
          const SizedBox(height: 16),
          Text(
            '© 2025 Suqna · Kaduna, Nigeria',
            style: TextStyle(
                color: Colors.white.withValues(alpha: 0.3),
                fontSize: 11,
                letterSpacing: 0.3),
          ),
        ],
      ),
    );
  }
}

class _FooterLink extends StatelessWidget {
  final String label;
  final String route;
  const _FooterLink(this.label, this.route);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: GestureDetector(
        onTap: () => context.go(route),
        child: Text(
          label,
          style: TextStyle(
              color: Colors.white.withValues(alpha: 0.55),
              fontSize: 13,
             fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
} 