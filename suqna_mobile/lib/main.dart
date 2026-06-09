import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/app.dart';
import 'core/api.dart';
import 'core/config.dart';
import 'features/auth/session.dart';
import 'models/models.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  const store = FlutterSecureStorage();

  final baseUrl = prefs.getString('baseUrl') ?? AppConfig.defaultBaseUrl;
  final token = await store.read(key: 'token');
  User? user;
  final userJson = prefs.getString('user');
  if (userJson != null) {
    try {
      user = User.fromJson(Map<String, dynamic>.from(jsonDecode(userJson)));
    } catch (_) {}
  }

  final api = ApiClient(baseUrl)..setToken(token);
  final session = Session(token: token, user: user, baseUrl: baseUrl);

  runApp(ProviderScope(
    overrides: [
      prefsProvider.overrideWithValue(prefs),
      secureStoreProvider.overrideWithValue(store),
      apiProvider.overrideWithValue(api),
      initialSessionProvider.overrideWithValue(session),
    ],
    child: const SuqnaApp(),
  ));
}
