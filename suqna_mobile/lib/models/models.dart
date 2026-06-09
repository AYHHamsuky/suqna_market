// Data models for the Suqna API. Laravel often serialises decimals as strings,
// so numeric parsing is defensive.

num? _num(dynamic v) {
  if (v == null) return null;
  if (v is num) return v;
  return num.tryParse(v.toString());
}

double? _dbl(dynamic v) => _num(v)?.toDouble();
int _int(dynamic v) => _num(v)?.toInt() ?? 0;
bool _bool(dynamic v) => v == true || v == 1 || v == '1' || v == 'true';
DateTime? _date(dynamic v) => v == null ? null : DateTime.tryParse(v.toString());

List<String> _strList(dynamic v) {
  if (v is List) return v.map((e) => e.toString()).toList();
  return const [];
}

class User {
  final int id;
  final String name;
  final String? email;
  final String? phone;
  final String role;
  final String? avatar;
  final bool phoneVerified;
  final VendorProfile? vendorProfile;

  User({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    required this.role,
    this.avatar,
    this.phoneVerified = false,
    this.vendorProfile,
  });

  bool get isCustomer => role == 'customer';
  bool get isVendor => role == 'vendor';
  bool get isAdmin => role == 'admin';

  factory User.fromJson(Map<String, dynamic> j) => User(
        id: _int(j['id']),
        name: j['name'] ?? '',
        email: j['email'],
        phone: j['phone'],
        role: j['role'] ?? 'customer',
        avatar: j['avatar'],
        phoneVerified: _bool(j['phone_verified']),
        vendorProfile: j['vendor_profile'] is Map
            ? VendorProfile.fromJson(Map<String, dynamic>.from(j['vendor_profile']))
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'avatar': avatar,
        'phone_verified': phoneVerified,
        'vendor_profile': vendorProfile?.toJson(),
      };
}

class VendorProfile {
  final int id;
  final String businessName;
  final String? slug;
  final String? description;
  final String? city;
  final String? state;
  final String? address;
  final double? lat;
  final double? lng;
  final double ratingAvg;
  final int ratingCount;
  final bool isApproved;
  final bool isOpen;
  final String? logo;
  final String? banner;
  final String? phone;

  VendorProfile({
    required this.id,
    required this.businessName,
    this.slug,
    this.description,
    this.city,
    this.state,
    this.address,
    this.lat,
    this.lng,
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.isApproved = false,
    this.isOpen = true,
    this.logo,
    this.banner,
    this.phone,
  });

  factory VendorProfile.fromJson(Map<String, dynamic> j) => VendorProfile(
        id: _int(j['id']),
        businessName: j['business_name'] ?? '',
        slug: j['slug'],
        description: j['description'],
        city: j['city'],
        state: j['state'],
        address: j['address'],
        lat: _dbl(j['latitude']),
        lng: _dbl(j['longitude']),
        ratingAvg: _dbl(j['rating_avg']) ?? 0,
        ratingCount: _int(j['rating_count']),
        isApproved: _bool(j['is_approved']),
        isOpen: j['is_open'] == null ? true : _bool(j['is_open']),
        logo: j['logo'],
        banner: j['banner'],
        phone: j['phone'],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'business_name': businessName,
        'slug': slug,
        'rating_avg': ratingAvg,
        'rating_count': ratingCount,
        'is_approved': isApproved,
      };
}

class Category {
  final int id;
  final String name;
  final String slug;
  final String? icon;

  Category({required this.id, required this.name, required this.slug, this.icon});

  factory Category.fromJson(Map<String, dynamic> j) => Category(
        id: _int(j['id']),
        name: j['name'] ?? '',
        slug: j['slug'] ?? '',
        icon: j['icon'],
      );
}

class Listing {
  final int id;
  final String name;
  final String? description;
  final String pricingMode;
  final num? price;
  final num? priceMin;
  final num? priceMax;
  final String? priceUnit;
  final bool isAvailable;
  final bool isFeatured;
  final List<String> tags;
  final List<String> images;
  final double? distanceKm;
  final Category? category;
  final VendorProfile? vendor;

  Listing({
    required this.id,
    required this.name,
    this.description,
    this.pricingMode = 'fixed',
    this.price,
    this.priceMin,
    this.priceMax,
    this.priceUnit,
    this.isAvailable = true,
    this.isFeatured = false,
    this.tags = const [],
    this.images = const [],
    this.distanceKm,
    this.category,
    this.vendor,
  });

  factory Listing.fromJson(Map<String, dynamic> j) => Listing(
        id: _int(j['id']),
        name: j['name'] ?? '',
        description: j['description'],
        pricingMode: j['pricing_mode'] ?? 'fixed',
        price: _num(j['price']),
        priceMin: _num(j['price_min']),
        priceMax: _num(j['price_max']),
        priceUnit: j['price_unit'],
        isAvailable: j['is_available'] == null ? true : _bool(j['is_available']),
        isFeatured: _bool(j['is_featured']),
        tags: _strList(j['tags']),
        images: _strList(j['images']),
        distanceKm: _dbl(j['distance_km']),
        category: j['category'] is Map
            ? Category.fromJson(Map<String, dynamic>.from(j['category']))
            : null,
        vendor: j['vendor'] is Map
            ? VendorProfile.fromJson(Map<String, dynamic>.from(j['vendor']))
            : null,
      );
}

class OrderItem {
  final int id;
  final int? listingId;
  final String listingName;
  final num quantity;
  final String? unit;
  final num unitPrice;
  final num subtotal;

  OrderItem({
    required this.id,
    this.listingId,
    required this.listingName,
    required this.quantity,
    this.unit,
    required this.unitPrice,
    required this.subtotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> j) => OrderItem(
        id: _int(j['id']),
        listingId: _num(j['listing_id'])?.toInt(),
        listingName: j['listing_name'] ?? '',
        quantity: _num(j['quantity']) ?? 1,
        unit: j['unit'],
        unitPrice: _num(j['unit_price']) ?? 0,
        subtotal: _num(j['subtotal']) ?? 0,
      );
}

class OrderReview {
  final int rating;
  final String? body;
  OrderReview({required this.rating, this.body});
  factory OrderReview.fromJson(Map<String, dynamic> j) =>
      OrderReview(rating: _int(j['rating']), body: j['body']);
}

class Order {
  final int id;
  final String reference;
  final String status;
  final num subtotal;
  final String deliveryType;
  final String? deliveryAddress;
  final String? notes;
  final DateTime? createdAt;
  final VendorProfile? vendor;
  final List<OrderItem> items;
  final OrderReview? review;
  final String? paymentStatus;

  Order({
    required this.id,
    required this.reference,
    required this.status,
    required this.subtotal,
    this.deliveryType = 'pickup',
    this.deliveryAddress,
    this.notes,
    this.createdAt,
    this.vendor,
    this.items = const [],
    this.review,
    this.paymentStatus,
  });

  factory Order.fromJson(Map<String, dynamic> j) => Order(
        id: _int(j['id']),
        reference: j['reference'] ?? '',
        status: j['status'] ?? 'pending',
        subtotal: _num(j['subtotal']) ?? 0,
        deliveryType: j['delivery_type'] ?? 'pickup',
        deliveryAddress: j['delivery_address'],
        notes: j['notes'],
        createdAt: _date(j['created_at']),
        vendor: j['vendor'] is Map
            ? VendorProfile.fromJson(Map<String, dynamic>.from(j['vendor']))
            : null,
        items: (j['items'] as List?)
                ?.map((e) => OrderItem.fromJson(Map<String, dynamic>.from(e)))
                .toList() ??
            const [],
        review: j['review'] is Map
            ? OrderReview.fromJson(Map<String, dynamic>.from(j['review']))
            : null,
        paymentStatus: j['payment'] is Map ? j['payment']['status'] : null,
      );
}

class ChatUser {
  final int id;
  final String name;
  final String? avatar;
  ChatUser({required this.id, required this.name, this.avatar});
  factory ChatUser.fromJson(Map<String, dynamic> j) =>
      ChatUser(id: _int(j['id']), name: j['name'] ?? '', avatar: j['avatar']);
}

class Conversation {
  final int id;
  final int customerId;
  final int vendorId;
  final int unreadCount;
  final ChatUser? customer;
  final VendorProfile? vendor;
  final String? lastBody;
  final DateTime? lastMessageAt;

  Conversation({
    required this.id,
    required this.customerId,
    required this.vendorId,
    this.unreadCount = 0,
    this.customer,
    this.vendor,
    this.lastBody,
    this.lastMessageAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> j) => Conversation(
        id: _int(j['id']),
        customerId: _int(j['customer_id']),
        vendorId: _int(j['vendor_id']),
        unreadCount: _int(j['unread_count']),
        customer: j['customer'] is Map
            ? ChatUser.fromJson(Map<String, dynamic>.from(j['customer']))
            : null,
        vendor: j['vendor'] is Map
            ? VendorProfile.fromJson(Map<String, dynamic>.from(j['vendor']))
            : null,
        lastBody: j['last_message'] is Map ? j['last_message']['body'] : null,
        lastMessageAt: _date(j['last_message_at']),
      );

  String title() => vendor?.businessName ?? customer?.name ?? 'Conversation';
}

class Message {
  final int id;
  final int senderId;
  final String? body;
  final String? attachment;
  final DateTime? createdAt;

  Message({
    required this.id,
    required this.senderId,
    this.body,
    this.attachment,
    this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> j) => Message(
        id: _int(j['id']),
        senderId: _int(j['sender_id']),
        body: j['body'],
        attachment: j['attachment'],
        createdAt: _date(j['created_at']),
      );
}

class Review {
  final int id;
  final int rating;
  final String? body;
  final String? vendorReply;
  final DateTime? createdAt;
  final String customerName;

  Review({
    required this.id,
    required this.rating,
    this.body,
    this.vendorReply,
    this.createdAt,
    this.customerName = '',
  });

  factory Review.fromJson(Map<String, dynamic> j) => Review(
        id: _int(j['id']),
        rating: _int(j['rating']),
        body: j['body'],
        vendorReply: j['vendor_reply'],
        createdAt: _date(j['created_at']),
        customerName: j['customer'] is Map ? (j['customer']['name'] ?? '') : '',
      );
}

/// A simple paginated list (Laravel paginator shape).
class Paged<T> {
  final List<T> data;
  final int currentPage;
  final int lastPage;
  Paged({required this.data, this.currentPage = 1, this.lastPage = 1});

  bool get hasMore => currentPage < lastPage;

  factory Paged.fromJson(Map<String, dynamic> j, T Function(Map<String, dynamic>) item) {
    return Paged(
      data: (j['data'] as List? ?? [])
          .map((e) => item(Map<String, dynamic>.from(e)))
          .toList(),
      currentPage: _int(j['current_page'] ?? 1),
      lastPage: _int(j['last_page'] ?? 1),
    );
  }
}
