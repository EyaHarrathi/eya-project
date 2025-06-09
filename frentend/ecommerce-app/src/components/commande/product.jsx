import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Package2, Search, Filter } from 'lucide-react';
import axios from 'axios';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis le localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
      fetchFriendsProducts(parsedUser.id);
    }
  }, []);

  const fetchFriendsProducts = async (userId) => {
    try {
      setLoading(true);
      
      // 1. Récupérer la liste des amis
      const friendsResponse = await axios.get(
        `http://localhost:8080/api/friends/list/${userId}`
      );
      const friends = friendsResponse.data;
      
      // 2. Pour chaque ami, récupérer ses produits
      const friendIds = friends.map(friend => friend.id);
      if (friendIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      const productsResponse = await axios.get(
        `http://localhost:8080/api/products/friends`,
        { params: { friendIds: friendIds.join(',') } }
      );
      
      setProducts(productsResponse.data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits", error);
      // Option: afficher un message d'erreur à l'utilisateur
    } finally {
      setLoading(false);
    }
  };

  const types = [...new Set(products.map(product => product.type))];

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedType || product.type === selectedType)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun produit disponible</h3>
        <p className="mt-2 text-sm text-gray-500">
          {userId ? 
            "Aucun produit disponible parmi vos amis." : 
            "Veuillez vous connecter pour voir les produits de vos amis."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Produits de vos amis</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="name">Nom</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="relative aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-100">
              <img
                src={product.image_url || "https://via.placeholder.com/300"}
                alt={product.name}
                className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              {product.quantity === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold px-4 py-2 bg-red-600 rounded-full">
                    Rupture de stock
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-indigo-600">
                  {product.price.toFixed(2)} TND
                </p>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 h-10">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-gray-700">{product.type}</span>
                </div>
                {product.quantity > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    {product.quantity} en stock
                  </span>
                )}
              </div>
              {product.colors && product.colors.length > 0 && (
                <div className="mt-3 flex items-center gap-1">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Filter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun résultat trouvé</h3>
          <p className="mt-2 text-sm text-gray-500">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
    </div>
  );
}