// Basic smoke test for the Suqna app's brand wordmark.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:suqna_mobile/core/theme.dart';

void main() {
  testWidgets('SuqnaWordmark renders', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: Center(child: SuqnaWordmark()))));
    expect(find.byType(SuqnaWordmark), findsOneWidget);
  });
}
