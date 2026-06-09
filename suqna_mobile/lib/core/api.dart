import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'config.dart';

/// Thin wrapper around Dio that carries the bearer token and current base URL.
class ApiClient {
  late Dio dio;
  String baseUrl;
  String? _token;

  /// Called when any request returns 401 (so the session can sign out).
  void Function()? onUnauthorized;

  ApiClient(this.baseUrl) {
    _build();
  }

  String get origin => AppConfig.originFrom(baseUrl);

  void setBaseUrl(String url) {
    baseUrl = url;
    _build();
  }

  void setToken(String? token) => _token = token;

  void _build() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 20),
      headers: {'Accept': 'application/json'},
    ));
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        if (_token != null) options.headers['Authorization'] = 'Bearer $_token';
        handler.next(options);
      },
      onError: (e, handler) {
        if (e.response?.statusCode == 401 && _token != null) onUnauthorized?.call();
        handler.next(e);
      },
    ));
  }

  /// Resolve an image/storage path returned by the API into an absolute URL.
  String? imageUrl(String? path) {
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http')) return path;
    return '$origin/storage/${path.replaceFirst(RegExp(r"^/?storage/?"), "")}';
  }
}

final apiProvider = Provider<ApiClient>((ref) {
  throw UnimplementedError('apiProvider must be overridden in main()');
});

/// Extracts a human-friendly message from a Dio error (mirrors web apiError()).
String apiError(Object err, [String fallback = 'Something went wrong.']) {
  if (err is DioException) {
    final data = err.response?.data;
    if (data is Map) {
      if (data['errors'] is Map && (data['errors'] as Map).isNotEmpty) {
        final first = (data['errors'] as Map).values.first;
        if (first is List && first.isNotEmpty) return first.first.toString();
        return first.toString();
      }
      if (data['message'] != null) return data['message'].toString();
    }
    if (err.type == DioExceptionType.connectionError ||
        err.type == DioExceptionType.connectionTimeout) {
      return 'Cannot reach the server. Check the API address in Profile → Settings.';
    }
    return err.message ?? fallback;
  }
  return fallback;
}
