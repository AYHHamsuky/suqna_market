import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api.dart';
import '../../models/models.dart';

// Providers overridden in main() after async bootstrap.
final prefsProvider = Provider<SharedPreferences>((ref) => throw UnimplementedError());
final secureStoreProvider = Provider<FlutterSecureStorage>((ref) => throw UnimplementedError());
final initialSessionProvider = Provider<Session>((ref) => throw UnimplementedError());

class Session {
  final String? token;
  final User? user;
  final String baseUrl;
  const Session({this.token, this.user, required this.baseUrl});

  bool get isAuthed => token != null && user != null;

  Session copyWith({String? token, User? user, String? baseUrl, bool clearAuth = false}) => Session(
        token: clearAuth ? null : (token ?? this.token),
        user: clearAuth ? null : (user ?? this.user),
        baseUrl: baseUrl ?? this.baseUrl,
      );
}

final sessionProvider =
    NotifierProvider<SessionController, Session>(SessionController.new);

class SessionController extends Notifier<Session> {
  ApiClient get _api => ref.read(apiProvider);
  SharedPreferences get _prefs => ref.read(prefsProvider);
  FlutterSecureStorage get _store => ref.read(secureStoreProvider);

  @override
  Session build() {
    final init = ref.read(initialSessionProvider);
    _api.setToken(init.token);
    _api.onUnauthorized = () {
      if (state.token != null) _clearLocal();
    };
    return init;
  }

  Future<void> _persist(String token, User user) async {
    await _store.write(key: 'token', value: token);
    await _prefs.setString('user', jsonEncode(user.toJson()));
  }

  void _clearLocal() {
    _store.delete(key: 'token');
    _prefs.remove('user');
    _api.setToken(null);
    state = state.copyWith(clearAuth: true);
  }

  Future<void> _applyToken(Map<String, dynamic> res) async {
    final token = res['token'] as String;
    final user = User.fromJson(Map<String, dynamic>.from(res['user']));
    await _persist(token, user);
    _api.setToken(token);
    state = state.copyWith(token: token, user: user);
  }

  Future<void> login(String login, String password) async {
    final res = await _api.dio.post('/auth/login', data: {'login': login, 'password': password});
    await _applyToken(Map<String, dynamic>.from(res.data));
  }

  Future<void> registerCustomer({
    required String name,
    String? email,
    String? phone,
    required String password,
  }) async {
    final res = await _api.dio.post('/auth/register/customer', data: {
      'name': name,
      if (email != null && email.isNotEmpty) 'email': email,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
      'password': password,
    });
    await _applyToken(Map<String, dynamic>.from(res.data));
  }

  Future<void> refreshMe() async {
    try {
      final res = await _api.dio.get('/auth/me');
      final user = User.fromJson(Map<String, dynamic>.from(res.data['user']));
      await _prefs.setString('user', jsonEncode(user.toJson()));
      state = state.copyWith(user: user);
    } catch (_) {/* keep cached user */}
  }

  Future<void> logout() async {
    try {
      await _api.dio.post('/auth/logout');
    } catch (_) {}
    _clearLocal();
  }

  Future<void> setBaseUrl(String url) async {
    await _prefs.setString('baseUrl', url);
    _api.setBaseUrl(url);
    _api.setToken(state.token);
    state = state.copyWith(baseUrl: url);
  }
}
