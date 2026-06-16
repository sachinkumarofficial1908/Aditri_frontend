import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, MessageCircle, Minus, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: 'Hi, I can help with products, cart, checkout, orders, login, GST, and contact details.',
};

const QUICK_PROMPTS = [
  'How do I place an order?',
  'Where is my cart?',
  'How is GST calculated?',
  'I need contact help',
];

const normalize = (text) => (
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const containsAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const formatAnswer = ({ title, steps = [], note, contact }) => {
  const lines = [title];

  if (steps.length) {
    lines.push('', ...steps.map((step, index) => `${index + 1}. ${step}`));
  }

  if (note) lines.push('', note);
  if (contact) lines.push('', 'Need more help?', contact);

  return lines.join('\n');
};

const HELP_INTENTS = [
  {
    id: 'privacy',
    keywords: ['admin', 'backend', 'database', 'mongodb', 'password', 'secret', 'private', 'internal', 'product edit'],
    answer: () => formatAnswer({
      title: 'I cannot share private or internal system details here.',
      steps: [
        'For account or access help, contact the Aditri team directly.',
        'For shopping help, I can guide you with products, cart, checkout, GST, and orders.',
      ],
      contact: '+91-9598033414 or aditri.c.services@gmail.com',
    }),
  },
  {
    id: 'gst',
    keywords: ['gst', 'tax', 'bill amount', 'invoice', 'subtotal', 'total'],
    answer: () => formatAnswer({
      title: 'GST is added in the bill before order placement.',
      steps: [
        'Product price is added to subtotal.',
        'GST is calculated product-wise.',
        'Shipping is added after GST.',
        'The final bill shows subtotal, GST, shipping, and total.',
      ],
      note: 'If GST looks wrong for any item, refresh the cart or remove and add the product again so the latest product data is used.',
    }),
  },
  {
    id: 'order',
    keywords: ['order', 'buy', 'purchase', 'place order', 'how to buy', 'material order'],
    answer: ({ isAuthenticated }) => formatAnswer({
      title: 'You can place an order from the Products page.',
      steps: [
        'Open Products and choose the required item.',
        'Click Add to Cart.',
        'Open Cart and review quantity, GST, shipping, and total.',
        isAuthenticated ? 'Continue to Checkout.' : 'Login or register to continue to Checkout.',
        'Enter delivery details, verify phone OTP, choose payment method, and place the order.',
      ],
    }),
  },
  {
    id: 'cart',
    keywords: ['cart', 'basket', 'quantity', 'remove item', 'add item'],
    answer: ({ itemCount }) => formatAnswer({
      title: itemCount > 0 ? `Your cart has ${itemCount} item${itemCount === 1 ? '' : 's'}.` : 'Your cart is empty right now.',
      steps: itemCount > 0
        ? ['Use the cart icon in the top navigation.', 'Change quantity with plus/minus buttons.', 'Review subtotal, GST, shipping, and total before checkout.']
        : ['Open Products.', 'Click Add to Cart on the item you need.', 'Then open the cart icon in the top navigation.'],
    }),
  },
  {
    id: 'checkout',
    keywords: ['checkout', 'payment', 'pay', 'otp', 'phone verification', 'delivery address', 'shipping'],
    answer: () => formatAnswer({
      title: 'Checkout needs delivery and phone verification details.',
      steps: [
        'Enter street, city, state, PIN code, and delivery phone.',
        'Send and verify the OTP.',
        'Choose payment method.',
        'Review the total and place the order.',
      ],
      note: 'Orders above Rs. 10,000 get free shipping.',
    }),
  },
  {
    id: 'login',
    keywords: ['login', 'register', 'signup', 'sign up', 'account', 'logout'],
    answer: ({ isAuthenticated }) => formatAnswer({
      title: isAuthenticated ? 'You are already logged in.' : 'You can login or register from the top navigation.',
      steps: isAuthenticated
        ? ['Use the profile menu to view orders or logout.']
        : ['Click Login.', 'Use your existing account or register as a new customer.', 'After login, continue checkout or view your orders.'],
    }),
  },
  {
    id: 'status',
    keywords: ['my order', 'track', 'status', 'delivered', 'shipped', 'pending', 'order history'],
    answer: ({ isAuthenticated }) => formatAnswer({
      title: isAuthenticated ? 'You can check order status in My Orders.' : 'Please login to check order status.',
      steps: isAuthenticated
        ? ['Open the profile menu.', 'Click My Orders.', 'Review status, items, GST, shipping, payment status, and total.']
        : ['Login from the top navigation.', 'Open My Orders from the profile menu.'],
    }),
  },
  {
    id: 'contact',
    keywords: ['contact', 'phone', 'email', 'support', 'help', 'call', 'address'],
    answer: () => formatAnswer({
      title: 'You can contact Aditri Constructions Services directly.',
      steps: [
        'Phone: +91-9598033414',
        'Email: aditri.c.services@gmail.com',
        'You can also open the Contact page from the navigation.',
      ],
    }),
  },
  {
    id: 'products',
    keywords: ['product', 'products', 'search', 'material', 'sku', 'brand', 'price', 'stock', 'category'],
    answer: () => formatAnswer({
      title: 'Use Products to find and compare materials.',
      steps: [
        'Search by product name, SKU, brand, or tag.',
        'Filter by category.',
        'Open a product to view images, price, stock, unit, and minimum order quantity.',
        'Add the item to cart when ready.',
      ],
    }),
  },
];

function findBestIntent(text) {
  return HELP_INTENTS
    .map((intent) => ({
      intent,
      score: intent.keywords.reduce((total, keyword) => (
        text.includes(keyword) ? total + keyword.split(' ').length : total
      ), 0),
    }))
    .sort((a, b) => b.score - a.score)[0];
}

function getHelpReply(message, { isAuthenticated, itemCount, pathname }) {
  const text = normalize(message);
  const bestMatch = findBestIntent(text);

  if (bestMatch?.score > 0) {
    return bestMatch.intent.answer({ isAuthenticated, itemCount, pathname });
  }

  if (pathname.startsWith('/products') && !containsAny(text, ['admin', 'private', 'password', 'secret'])) {
    return formatAnswer({
      title: 'You are on the Products page.',
      steps: [
        'Search or filter products.',
        'Open a product for details.',
        'Add items to cart and continue to checkout.',
      ],
    });
  }

  return formatAnswer({
    title: 'I can help with common shopping and support questions.',
    steps: [
      'Products and material search',
      'Cart, GST, shipping, and checkout',
      'Login, order status, and contact support',
    ],
    note: 'Try asking: "How do I place an order?" or "How is GST calculated?"',
  });
}

export default function AiHelpChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const scrollRef = useRef(null);

  const context = useMemo(() => ({
    isAuthenticated,
    itemCount,
    pathname: location.pathname,
  }), [isAuthenticated, itemCount, location.pathname]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = (text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    setMessages((current) => [
      ...current,
      { role: 'user', text: cleanText },
      { role: 'assistant', text: getHelpReply(cleanText, context) },
    ]);
    setInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-4 z-[70] sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-primary-700 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Help</p>
                  <p className="text-xs text-primary-100">Aditri support assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-white/85 transition hover:bg-white/10 hover:text-white"
                  aria-label="Minimize help chat"
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([INITIAL_MESSAGE]);
                    setOpen(false);
                  }}
                  className="rounded-lg p-1.5 text-white/85 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close help chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[84%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-100 bg-white text-gray-700 shadow-sm'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="border-t border-gray-100 bg-white px-4 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 min-w-0 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="Ask for help..."
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send help message"
                >
                  <Send size={16} />
                </button>
              </form>

              <Link to="/contact" className="mt-2 block text-center text-xs font-medium text-primary-700 hover:underline">
                Contact support
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-white shadow-xl shadow-primary-900/25 transition hover:-translate-y-0.5 hover:bg-primary-800"
        aria-label="Open AI help chat"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
