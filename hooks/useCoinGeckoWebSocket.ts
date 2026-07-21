"use client";

import { useEffect, useRef, useState } from "react";

const WS_BASE = `${process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL}?x_cg_pro_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`;

/* Manages the CoinGecko WebSocket connection in one place: opens the socket,
   subscribes to the right channels, answers keep-alive pings and translates
   incoming messages into React state. NOTE: the WebSocket API requires a paid
   (Analyst+) plan — on a demo key the connection is refused and every consumer
   simply keeps its fetched fallback data. */
export const useCoinGeckoWebSocket = ({
  coinId,
  poolId,
  liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  /* tracks active channel subscriptions to prevent duplicates */
  const subscribed = useRef<Set<string>>(new Set());

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcvData, setOhlcvData] = useState<OHLCData | null>(null);
  const [isWsReady, setIsWsReady] = useState(false);

  /* connection management */
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL) return;

    let ws: WebSocket;

    try {
      ws = new WebSocket(WS_BASE);
    } catch (error) {
      console.error("Failed to open CoinGecko WebSocket:", error);
      return;
    }

    wsRef.current = ws;

    const send = (payload: Record<string, unknown>) => {
      ws.send(JSON.stringify(payload));
    };

    const handleMessage = (event: MessageEvent) => {
      const message: WebSocketMessage = JSON.parse(event.data);

      /* server keep-alive — as long as we answer, the connection stays open */
      if (message.type === "ping") {
        send({ type: "pong" });
        return;
      }

      if (message.type === "confirm_subscription") {
        const { channel } = JSON.parse(message.identifier ?? "{}");
        if (channel) subscribed.current.add(channel);
        return;
      }

      /* price updates */
      if (message.c === "c1") {
        setPrice({
          usdPrice: message.p ?? 0,
          coin: message.i ?? "",
          price: message.p ?? 0,
          change24h: message.pp ?? 0,
          marketCap: message.m ?? 0,
          volume24h: message.v ?? 0,
          timestamp: message.t ?? 0,
        });
      }

      /* trade updates */
      if (message.c === "g2") {
        const newTrade: Trade = {
          price: message.pu ?? 0,
          value: message.vo ?? 0,
          timestamp: message.t ?? 0,
          type: message.ty ?? "",
          amount: message.a ?? 0,
        };

        setTrades((prev) => [newTrade, ...prev].slice(0, 7));
      }

      /* candlestick (OHLCV) updates */
      if (message.ch === "g3") {
        const timestamp = message.t ?? 0;

        const candle: OHLCData = [
          timestamp,
          Number(message.o ?? 0),
          Number(message.h ?? 0),
          Number(message.l ?? 0),
          Number(message.c ?? 0),
        ];

        setOhlcvData(candle);
      }
    };

    ws.onopen = () => setIsWsReady(true);
    ws.onmessage = handleMessage;
    ws.onclose = () => setIsWsReady(false);
    ws.onerror = (event) => {
      console.error("CoinGecko WebSocket error:", event);
      setIsWsReady(false);
    };

    return () => ws.close();
  }, []);

  /* subscription management */
  useEffect(() => {
    if (!isWsReady) return;

    const ws = wsRef.current;
    if (!ws) return;

    const send = (payload: Record<string, unknown>) => {
      ws.send(JSON.stringify(payload));
    };

    const unsubscribeAll = () => {
      subscribed.current.forEach((channel) => {
        send({
          command: "unsubscribe",
          identifier: JSON.stringify({ channel }),
        });
      });
      subscribed.current.clear();
    };

    const subscribe = (channel: string, data?: Record<string, unknown>) => {
      if (subscribed.current.has(channel)) return;

      send({
        command: "subscribe",
        identifier: JSON.stringify({ channel }),
      });

      if (data) {
        send({
          command: "message",
          identifier: JSON.stringify({ channel }),
          data: JSON.stringify(data),
        });
      }
    };

    /* reset local state after the current call stack to avoid mid-render updates */
    queueMicrotask(() => {
      setPrice(null);
      setTrades([]);
      setOhlcvData(null);

      unsubscribeAll();

      subscribe("CGSimplePriceChannel", {
        coin_id: [coinId],
        action: "set_tokens",
      });
    });

    const poolAddress = (poolId ?? "").replace("_", ":");

    if (poolAddress) {
      subscribe("GTTradeChannel", {
        network_id: poolAddress.split(":")[0],
        pool_addresses: [poolAddress],
        action: "set_pools",
      });

      subscribe("GTOHLCVChannel", {
        network_id: poolAddress.split(":")[0],
        pool_addresses: [poolAddress],
        action: "set_pools",
        interval: liveInterval,
      });
    }
  }, [coinId, poolId, isWsReady, liveInterval]);

  return { price, trades, ohlcvData, isConnected: isWsReady };
};
